var Pulse = React.createClass({
	componentDidMount: function () {
		var el = $(this.getDOMNode());
		var seg = el.find(".segment").eq(0);
		seg.css({ left: 100, top: 125, width: 200, height: 10 });
		seg = el.find(".segment").eq(1);
		seg.css({ left: 300, top: 125, width: 50, height: 10, transform: "rotate(90deg)", transformOrigin: "0 0" });
	},

	render: function () {
		return (
			<div className="pulse">
				<div className="segment"></div>
				<div className="segment"></div>
			</div>
		);
	}
});
