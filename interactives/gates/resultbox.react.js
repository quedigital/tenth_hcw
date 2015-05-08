var ResultBox = React.createClass({
	render: function () {
		var display = this.props.result ? "1" : "0";

		return (
			<div className="part result-box">
				<span className="blue">{ display }</span>
				<span className="white">{ display }</span>
				<span className="red">{ display }</span>
			</div>
		);
	}
});
