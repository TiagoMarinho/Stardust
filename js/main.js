import Engine from "./engine.js"

let main = ((gameCanvasId, debugCanvasId, computationCounterId, fpsCounterId, msCounterId) => {
	const gameCanvas = document.getElementById(gameCanvasId),
		debugCanvas = document.getElementById(debugCanvasId)

	const fitWindowSize = ((...canvases) => {
		for (const canvas of canvases) {
			canvas.width = innerWidth
			canvas.height = innerHeight
		}
	})(gameCanvas)
	
	window.addEventListener("resize", _ => {
		fitWindowSize(gameCanvas)
	})

	const app = new Engine(gameCanvas, debugCanvas)
	app.run()

	setInterval(_ => {
		const fpsCounter = document.getElementById(fpsCounterId)
		const fps = Math.trunc(app.profiler.fps)

		const msCounter = document.getElementById(msCounterId)
		const ms = Math.trunc(app.profiler.ms)

		const computationCounter = document.getElementById(computationCounterId)
		const computation = app.scene.physicsWorld.computationsPerIteration

		fpsCounter.innerHTML = `${fps}fps`
		msCounter.innerHTML = `${ms}ms`
		computationCounter.innerHTML = `${computation}cpi`

	}, 1000 / 10)
})("gameCanvas", "debugCanvas", "computation-counter", "fps-counter", "ms-counter")