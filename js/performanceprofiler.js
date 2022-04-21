export default class PerformanceProfiler {
	#start = 0
	fps = 0
	ms = 0
	beginProfiling () {
		this.#start = performance.now()
	}
	finishProfiling () {
		const current = performance.now(),
			delta = current - this.#start

		this.fps = 1000 / delta
		this.ms = delta
	}
}