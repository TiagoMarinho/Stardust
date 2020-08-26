class PerformanceProfiler {
	constructor () {
		this.fps = 0
		this.ms = 0
		this._start = 0
	}
	beginProfiling () {
		this._start = performance.now()
	}
	finishProfiling () {
		const current = performance.now(),
			delta = current - this._start

		this.fps = 1000 / delta
		this.ms = delta
	}
}