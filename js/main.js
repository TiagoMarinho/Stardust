import Engine from "./engine.js"

let main = ((gameCanvasId, debugCanvasId, computationCounterId, fpsCounterId, msCounterId) => {
	const gameCanvas = document.getElementById(gameCanvasId),
		debugCanvas = document.getElementById(debugCanvasId)

	const fitWindowSize = (...canvases) => {
		for (const canvas of canvases) {
			canvas.width = innerWidth
			canvas.height = innerHeight
		}
	}
	fitWindowSize(gameCanvas)
	window.addEventListener("resize", _ => {
		fitWindowSize(gameCanvas)
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

		const computationCounter = document.getElementById(computationCounterId),
			computation = app.scene.physicsWorld.computationsPerIteration
		computationCounter.innerHTML = `${computation}cpi`
	}, 1000 / 10)
})("gameCanvas", "debugCanvas", "computation-counter", "fps-counter", "ms-counter")