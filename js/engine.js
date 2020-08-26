class Engine {
	constructor (canvas, debugCanvas) {
		this.scene = new Scene(canvas, debugCanvas)
		this.darkThemePalette = ["#FF3658", "#FFD939", "#97FB32", "#32CEF4", "#FE60D6"]
		this.palette = ["#FF3658", "#97AB32", "#32CEF4", "#FE60D6"]
		this.profiler = new PerformanceProfiler()
	}
	run (overrideSeed) {
		let seed = `${Math.random()}`
		seed = overrideSeed ? overrideSeed : parseInt(seed.substr(2, seed.length))
		Math.seedrandom(seed)
		console.log(`seed: ${seed}`)

		const testCases = {
			simpleCollision: _ => {
				const center = {x: innerWidth / 2, y: innerHeight / 2}

				const bluePlanet = new Planet("#0cf", new Point(center.x - 500, center.y), 5)
				this.scene.addChild(bluePlanet)

				const pinkPlanet = new Planet("#f0c", new Point(center.x + 20, center.y), 200)
				this.scene.addChild(pinkPlanet)
			},
			simpleOrbit: _ => {
				const center = {x: innerWidth / 2, y: innerHeight / 2}

				const bluePlanet = new Planet("#0cf", new Point(center.x - 50, center.y), 15)
				this.scene.addChild(bluePlanet)

				const pinkPlanet = new Planet("#f0c", new Point(center.x, center.y), 30)
				this.scene.addChild(pinkPlanet)

				const totalMass = bluePlanet.physicsBody.mass + pinkPlanet.physicsBody.mass
				pinkPlanet.physicsBody.velocity.dy = 5 * -bluePlanet.physicsBody.mass / totalMass
				bluePlanet.physicsBody.velocity.dy = 5 * pinkPlanet.physicsBody.mass / totalMass
			},
			randomSimpleCollision: (n = 3) => {
				for (let i = 0; i < n; ++i) {
					const x = Math.random() * 300,
						y = Math.random() * 300,
						color = this.palette[Math.floor(Math.random() * (this.palette.length - 1))]

					const myPlanet = new Planet(color, new Point(x, y), Math.random() * 3 + 2)
					this.scene.addChild(myPlanet)
				}
			},
			randomCluster: (n = 1000) => {
				const width = window.innerWidth,
					height = window.innerHeight
				for (let i = 0; i < n; ++i) {
					const x = innerWidth / 2 + Utils.getRandomFloat(-width / 2, width / 2, seed),
					y = innerHeight / 2 + Utils.getRandomFloat(-height / 2, height / 2, seed),
					color = this.palette[Math.floor(Math.random() * (this.palette.length - 1))]

					const myPlanet = new Planet(color, new Point(x, y), 2)
					myPlanet.density = 100
					this.scene.addChild(myPlanet)
				}
			},
			galaxy: (n, radius) => {
				const center = new Point(innerWidth / 2, innerHeight / 2),
					color = "#f00",
					blackHole = new Planet(color, center, 2)

				blackHole.physicsBody.density = 20
				this.scene.addChild(blackHole)

				for (let i = 0; i < n; ++i) {
					const center = new Point(innerWidth / 2, innerHeight / 2),
						radians = Utils.getRandomFloat(0, Math.PI * 2),
						distance = radius * Math.sqrt(Math.random()),
						x = center.x + distance * Math.sin(radians),
						y = center.y + distance * Math.cos(radians),
						speed = 1 / distance * 20,
						planet = new Planet("#fff", new Point(x, y), 0.1)

					planet.physicsBody.velocity.dx = Math.sin(radians + Math.PI / 2) * speed
					planet.physicsBody.velocity.dy = Math.cos(radians + Math.PI / 2) * speed

					this.scene.addChild(planet)
				}
			}
		}

		//testCases.simpleCollision()
		//testCases.simpleOrbit()
		testCases.randomCluster(3000)
		//testCases.randomSimpleCollision(10)
		//testCases.galaxy(5000, 100)

		this.update()
	}
	addPlanetsToMissingQuota (quota) {
		const missingPlanets = Math.max(quota - this.scene.physicsWorld.bodies.length, 0) // for fun
		for (let i = 0; i < missingPlanets; ++i) {
			const side = Utils.getRandomBool(),
				isVertical = Utils.getRandomBool(),
				color = this.palette[Math.floor(Math.random() * (this.palette.length - 1))],
				x = isVertical ? Utils.getRandomFloat(0, innerWidth) : (side ? 0 : innerWidth),
				y = isVertical ? (side ? 0 : innerHeight) : Utils.getRandomFloat(0, innerHeight)

			const myPlanet = new Planet(color, new Point(x, y), Math.random() * 2 + 1)
			this.scene.addChild(myPlanet)
		}
	}
	update () {

		this.profiler.finishProfiling()
		this.profiler.beginProfiling()

		this.scene.update()

		requestAnimationFrame(_ => { // maybe move somewhere else?
			//this.addPlanetsToMissingQuota(1000)

			this.update()
		})
	}
}
