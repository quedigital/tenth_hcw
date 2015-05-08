var NotGate = React.createClass({
	getInitialState : function () {
		return {
			input: 0,
			output: 1
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

		this.paper = Raphael(10, 50, 320, 200);
		var c = this.paper.path("M10 10L90 90L190 90");
		c.attr("stroke-width", 5);
		c.attr("stroke", "black");
		c.hide();

		var len = c.getTotalLength();
		console.log(len);
		var s1 = c.getSubpath(0, len * .5);
		var c2 = this.paper.path(s1);
		console.log(c2);
		c2.attr("stroke", "blue");
		c2.attr("stroke-width", 5);
		c2.glow({ color: "#f0f000" });
	},

	render: function () {
		return (
			<div className="gate not-gate">
				<div className="positioner input"><span className="label">Input Bit</span></div>
				<RadioSwitch ref="myInput" checked={ this.state.input == 1 } onChange={ this.onChangeInput }/>
				<img ref="myBack" className="part" src="assets/not-gate.png"/>
				<ClockPulse ref="myClock"/>
				<Switch ref="mySwitch" orientation="horizontal" open={ this.state.input } />
				<ResultBox ref="myResult" result={ this.state.output } />
				<div className="positioner output"><span className="label">Output Bit</span></div>
				<div className="positioner clock"><span className="label">Clock Pulse</span></div>
				{/*<Pulse></Pulse>*/}
			</div>
		);
	},

	onChangeInput: function (event) {
		var input = event.target.checked;
		var output = !input;

		this.setState( { input: input, output: output } );
	}
});
