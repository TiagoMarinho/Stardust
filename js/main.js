let main = (gameCanvasId, fpsCounterId, msCounterId) => {
	const gameCanvas = document.getElementById(gameCanvasId)

	const fitWindowSize = (canvas) => {
		canvas.width = innerWidth
		canvas.height = innerHeight
	}
	fitWindowSize(gameCanvas)
	window.addEventListener("resize", _ => {
		fitWindowSize(gameCanvas)
	})

	const app = new Engine(gameCanvas)
	app.run()

	setInterval(_ => {
		const fpsCounter = document.getElementById(fpsCounterId),
			fps = Math.trunc(app.profiler.fps)
		fpsCounter.innerHTML = `${fps}fps`

		const msCounter = document.getElementById(msCounterId),
			ms = Math.trunc(app.profiler.ms)
		msCounter.innerHTML = `${ms}ms`
	}, 1000 / 10)
}