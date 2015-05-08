var GatesApp = React.createClass({
	componentDidMount: function () {
		var gate1 = $(this.refs.gate1.getDOMNode());
		gate1.css({ left: 25, top: 25 });
	},

	render: function () {
		return (
			<NotGate ref="gate1"></NotGate>
		);
	}
});
