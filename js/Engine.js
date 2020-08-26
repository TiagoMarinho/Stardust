class Engine {
	constructor (canvas) {
		this.scene = new Scene(canvas)
		this.palette = ["#FF3658", "#FFD939", "#97FB32", "#32CEF4", "#FE60D6"]
		this.profiler = new PerformanceProfiler()
	}
	run () {
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
				const width = innerWidth,
					height = innerHeight
				for (let i = 0; i < n; ++i) {
					const x = innerWidth / 2 + Utils.getRandomFloat(-width / 2, width / 2),
					y = innerHeight / 2 + Utils.getRandomFloat(-height / 2, height / 2),
					color = this.palette[Math.floor(Math.random() * (this.palette.length - 1))],
					radius = Math.random() * 1 + 1

					const myPlanet = new Planet(color, new Point(x, y), radius)
					this.scene.addChild(myPlanet)
				}
			}
		}

		//testCases.simpleCollision()
		//testCases.simpleOrbit()
		testCases.randomCluster(1000)
		//testCases.randomSimpleCollision(1000)

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