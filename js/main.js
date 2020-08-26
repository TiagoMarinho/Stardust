let main = (gameCanvasId, debugCanvasId, fpsCounterId, msCounterId) => {
	const gameCanvas = document.getElementById(gameCanvasId),
		debugCanvas = document.getElementById(debugCanvasId)

	const fitWindowSize = (...canvases) => {
		for (canvas of canvases) {
			canvas.width = innerWidth
			canvas.height = innerHeight
		}
	}
	fitWindowSize(gameCanvas, debugCanvas)
	window.addEventListener("resize", _ => {
		fitWindowSize(gameCanvas, debugCanvas)
	})

	const app = new Engine(gameCanvas, debugCanvas)
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