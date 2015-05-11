var ResultBox = React.createClass({
	render: function () {
		var display = "";

		switch (this.props.result) {
			case 1:
			case true:
				display = "1"; break;
			case 0:
			case false:
				display = "0"; break;
			default:
				display = ""; break;
		}

		return (
			<div className="part result-box">
				<span className="blue">{ display }</span>
				<span className="white">{ display }</span>
				<span className="red">{ display }</span>
			</div>
		);
	}
});
