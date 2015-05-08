var Switch = React.createClass({
	getInitialState: function () {
		return { open: false };
	},

	componentDidMount: function () {
		var el = $(this.getDOMNode());
		el.css( { transform: "rotate(" + this.getSwitchAngle() + "deg)" } );
	},

	componentDidUpdate: function () {
		var el = $(this.getDOMNode());
		el.css( { transform: "rotate(" + this.getSwitchAngle() + "deg)" } );
	},

	render: function () {
		return (
			<div className="part switch" onClick={ this.onClickSwitch }>
				<img ref="myArrow" className="part switch-arrow" src="assets/arrow.png"/>
			</div>
		);
	},

	onClickSwitch: function () {
		this.setState( { open: !this.state.open } );
	},

	getSwitchAngle: function () {
		var rot = 0;

		switch (this.props.orientation) {
			case "horizontal":
				rot = -90;
				break;
		}

		if (this.props.open)
			rot -= 45;

		return rot;
	}
});
