define([""], function () {
	function sqr(x) { return x * x }
	
	function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
	
	function distToSegmentSquared(p, v, w) {
	  var l2 = dist2(v, w);
	  if (l2 == 0) return dist2(p, v);
	  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
	  if (t < 0) return dist2(p, v);
	  if (t > 1) return dist2(p, w);
	  return dist2(p, { x: v.x + t * (w.x - v.x),
						y: v.y + t * (w.y - v.y) });
	}
	
	function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

	function sideOfLineSegment (p, a, b) {
		var s = ( b.x - a.x ) * ( p.y - a.y ) - ( b.y - a.y ) * ( p.x - a.x ); 
		if( s > 0 ) return 1;      // ..left of line 
		else if( s < 0 ) return -1;  // ..right of line 
		else return 0;
	}
	
	// NOTE: this just computes distance from p to a, not the point on the path ab closest to p
	function distanceAlongSegment (p, a, b) {
		var pt1 = closestPointAlongSegment(p, a, b);
		
		return Math.sqrt(dist2(pt1, a));
	}
	
	function pointLineSegmentParameter (p2, p0, p1) {
		var x10 = p1.x - p0.x, y10 = p1.y - p0.y,
			x20 = p2.x - p0.x, y20 = p2.y - p0.y;
		return (x20 * x10 + y20 * y10) / (x10 * x10 + y10 * y10);
	}
	
	function closestPointAlongSegment (p2, p0, p1) {
		var t = pointLineSegmentParameter(p2, p0, p1);
		var x10 = p1.x - p0.x,
			y10 = p1.y - p0.y,
			p3 = { x: p0.x + t * x10, y: p0.y + t * y10 };
		return p3;
	}	
		
	var utils = {
		distToSegment: distToSegment,
		sideOfLineSegment: sideOfLineSegment,
		distanceAlongSegment: distanceAlongSegment,
		closestPointAlongSegment: closestPointAlongSegment
	}
	
	return utils;
});