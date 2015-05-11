var NotGate = React.createClass({
	getInitialState : function () {
		return {
			input: 0,
			output: 1,
			visibleOutput: ""
		}
	},

	componentDidMount: function () {
		var in1 = $(this.refs.myInput.getDOMNode());
		in1.css({ left: 84, top: 42 });

		var back = $(this.refs.myBack.getDOMNode());
		back.css({ left: 21, top: 90 });

		var clock = $(this.refs.myClock.getDOMNode());
		clock.css({ left: 0, top: 146 });

		var sw1 = $(this.refs.mySwitch.getDOMNode());
		sw1.css( { left: 102, top: 160 } );

		var res = $(this.refs.myResult.getDOMNode());
		res.css({ left: 95, top: 300 });

		this.raff = Raphael(0, 0, 320, 320);

		setInterval(this.startClockPulse, 3000);
	},

	componentDidUpdate: function () {
	},

	render: function () {
		return (
			<div className="gate not-gate">
				<div className="positioner input"><span className="label">Input Bit</span></div>
				<RadioSwitch ref="myInput" checked={ this.state.input == 1 } onChange={ this.onChangeInput }/>
				<img ref="myBack" className="part" src="assets/not-gate.png"/>
				<ClockPulse ref="myClock"/>
				<Switch ref="mySwitch" orientation="horizontal" open={ this.state.input } />
				<ResultBox ref="myResult" result={ this.state.visibleOutput } />
				<div className="positioner output"><span className="label">Output Bit</span></div>
				<div className="positioner clock"><span className="label">Clock Pulse</span></div>
				{/*<Pulse></Pulse>*/}
			</div>
		);
	},

	onChangeInput: function (event) {
		this.clearClockPulse();

		var input = event.target.checked;
		var output = !input;

		this.setState( { input: input, output: output, visibleOutput: "" } );
	},

	startClockPulse: function () {
		this.clearClockPulse();

		var p;

		if (this.state.input) {
			p = this.raff.path("M62 189L135 189L179 145");
		} else {
			p = this.raff.path("M62 189L236 189L236 208L173 208L173 318");
		}
		p.attr("stroke-width", 3);
		p.attr("stroke", "black");
		p.hide();

		this.currentCircuit = p;
		this.circuitPercent = 0;
		this.animateInterval = setInterval(this.animateClockPulse, 50);
	},

	animateClockPulse: function () {
		var pct = this.circuitPercent;

		if (this.currentPath) {
			this.currentPath.remove();
		}

		if (this.currentGlow) {
			this.currentGlow.remove();
		}

		var len = this.currentCircuit.getTotalLength();
		var s1 = this.currentCircuit.getSubpath(0, len * pct);
		var p = this.raff.path(s1);
		p.attr("stroke", "#ffff00");
		p.attr("stroke-width", 3);
		this.currentGlow = p.glow({ color: "#3C5CE0" });

		this.currentPath = p;

		this.circuitPercent += .1;

		if (this.circuitPercent >= 1) {
			this.setState({ visibleOutput: this.state.output });

			var anim1 = Raphael.animation( { opacity: 0 }, 1000, "easeOut" );
			this.currentPath.animate(anim1.delay(500));
			var anim2 = Raphael.animation( { opacity: 0 }, 1000, "easeOut" );
			this.currentGlow.animate(anim2.delay(0));

			var result = $(this.getDOMNode()).find(".result-box");
			result.removeClass("animated").hide(0).addClass("animated tada").show(0);

			if (this.animateInterval) {
				clearInterval(this.animateInterval);
			}
		}
	},

	clearClockPulse: function () {
		if (this.currentCircuit) {
			this.currentCircuit.remove();
		}

		if (this.animateInterval) {
			clearInterval(this.animateInterval);
		}

		if (this.currentPath) {
			this.currentPath.remove();
		}

		if (this.currentGlow) {
			this.currentGlow.remove();
		}
	}
});
