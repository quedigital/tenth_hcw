var RadioSwitch = React.createClass({
	componentDidMount: function () {
		this.adjustThumb();
	},

	componentDidUpdate: function () {
		this.adjustThumb();
	},

	render: function () {
		return (
			<div className="part bitSwitch">
				<input id="myCheckBox" type="checkbox" checked={ this.props.checked } onChange={ this.props.onChange }/>
				<label htmlFor="myCheckBox"></label>
			</div>
		);
	},

	adjustThumb: function () {
		var el = $(this.getDOMNode());
		var val = el.find("input").prop("checked");

		el.find("label").css("left", val ? 83 : -3);
	}
});