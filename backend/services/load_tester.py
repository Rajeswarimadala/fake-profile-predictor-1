import asyncio
import time
import httpx
from typing import Dict, Any, List

class LoadTester:
    def __init__(self):
        self.state = "idle"  # idle, running, completed
        self.concurrency = 100
        self.duration = 60
        self.start_time = 0
        self.elapsed_time = 0
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.latencies: List[float] = []
        self.logs: List[str] = []
        self._workers_task = None
        self._current_run_id = 0

    def log(self, message: str):
        timestamp = time.strftime("%H:%M:%S")
        self.logs.append(f"[{timestamp}] {message}")

    async def run_worker(self, client: httpx.AsyncClient, target_url: str, end_time: float, run_id: int):
        while time.time() < end_time and self.state == "running" and self._current_run_id == run_id:
            req_start = time.time()
            try:
                # Target the local endpoint
                response = await client.get(target_url, timeout=5.0)
                latency = (time.time() - req_start) * 1000  # in ms
                if self._current_run_id == run_id:
                    self.latencies.append(latency)
                    self.total_requests += 1
                    if response.status_code == 200:
                        self.successful_requests += 1
                    else:
                        self.failed_requests += 1
            except Exception as e:
                if self._current_run_id == run_id:
                    self.failed_requests += 1
                    self.total_requests += 1
                # Small pause on network/connection errors to avoid hammering CPU
                await asyncio.sleep(0.02)
            
            # Yield control to prevent starvation
            await asyncio.sleep(0.001)

    async def run_test_loop(self, concurrency: int, duration: int, target_url: str, run_id: int):
        self.state = "running"
        self.concurrency = concurrency
        self.duration = duration
        self.start_time = time.time()
        self.elapsed_time = 0
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.latencies = []
        self.logs = []

        self.log(f"Initializing baseline load test...")
        self.log(f"Target URL: {target_url}")
        self.log(f"Configuration: Concurrency={concurrency} VUs, Duration={duration}s")
        
        end_time = self.start_time + duration
        
        # Configure keep-alive connections to match concurrency to support simultaneous virtual users
        limits = httpx.Limits(max_keepalive_connections=concurrency, max_connections=concurrency * 2)
        
        try:
            async with httpx.AsyncClient(limits=limits) as client:
                self.log(f"Spawning {concurrency} virtual users...")
                workers = [
                    asyncio.create_task(self.run_worker(client, target_url, end_time, run_id))
                    for _ in range(concurrency)
                ]
                
                self.log("Virtual users spawned. Test running...")
                
                # Periodically log statistics during execution
                while time.time() < end_time and self.state == "running" and self._current_run_id == run_id:
                    await asyncio.sleep(1.0)
                    self.elapsed_time = int(time.time() - self.start_time)
                    
                    elapsed = max(1, self.elapsed_time)
                    current_rps = round(self.total_requests / elapsed, 1)
                    avg_lat = round(sum(self.latencies) / len(self.latencies), 1) if self.latencies else 0.0
                    
                    # Log every 5 seconds to avoid spamming the log console too much
                    if self.elapsed_time % 5 == 0:
                        self.log(
                            f"Progress: {self.elapsed_time}s/{duration}s - "
                            f"Requests: {self.total_requests} (Success: {self.successful_requests}, Fail: {self.failed_requests}) - "
                            f"RPS: {current_rps} - "
                            f"Avg Latency: {avg_lat}ms"
                        )
                
                # If stopped or completed, gather all worker tasks
                for w in workers:
                    w.cancel()
                await asyncio.gather(*workers, return_exceptions=True)
                
        except Exception as e:
            self.log(f"System Error during load test execution: {str(e)}")
            
        finally:
            if self._current_run_id == run_id:
                self.elapsed_time = int(time.time() - self.start_time)
                self.state = "completed"
                self.log("Load test completed successfully!")
                self.log(
                    f"Final Report: Total Requests={self.total_requests} | "
                    f"RPS={self.get_rps()} req/sec | "
                    f"Latency: Min={self.get_min_latency()}ms, Avg={self.get_avg_latency()}ms, Max={self.get_max_latency()}ms"
                )

    def start(self, concurrency: int, duration: int, target_url: str):
        if self.state == "running":
            self.log("Test already running. Stop the current test first.")
            return
            
        self._current_run_id += 1
        self._workers_task = asyncio.create_task(
            self.run_test_loop(concurrency, duration, target_url, self._current_run_id)
        )

    def stop(self):
        if self.state == "running":
            self.state = "idle"
            self._current_run_id += 1
            if self._workers_task:
                self._workers_task.cancel()
            self.log("Load test execution halted by user.")

    def get_rps(self) -> float:
        duration = max(1, self.elapsed_time)
        return round(self.total_requests / duration, 1)

    def get_avg_latency(self) -> float:
        if not self.latencies:
            return 0.0
        return round(sum(self.latencies) / len(self.latencies), 1)

    def get_min_latency(self) -> float:
        if not self.latencies:
            return 0.0
        return round(min(self.latencies), 1)

    def get_max_latency(self) -> float:
        if not self.latencies:
            return 0.0
        return round(max(self.latencies), 1)

    def get_status(self) -> Dict[str, Any]:
        now = time.time()
        elapsed = int(now - self.start_time) if self.state == "running" else self.elapsed_time
        
        # Calculate intermediate metrics
        total = self.total_requests
        success = self.successful_requests
        fail = self.failed_requests
        
        rps = round(total / max(1, elapsed), 1)
        avg_lat = self.get_avg_latency()
        min_lat = self.get_min_latency()
        max_lat = self.get_max_latency()
        
        return {
            "state": self.state,
            "concurrency": self.concurrency,
            "duration": self.duration,
            "elapsed_time": elapsed,
            "total_requests": total,
            "successful_requests": success,
            "failed_requests": fail,
            "rps": rps,
            "latency": {
                "avg": avg_lat,
                "min": min_lat,
                "max": max_lat
            },
            "logs": self.logs
        }

# Global singleton load tester
load_tester_instance = LoadTester()
