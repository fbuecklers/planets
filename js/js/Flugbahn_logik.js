schnitt: Function (r, s, rad) {
var rs = r.dot(s)
var rr = r.dot(r)
var int = Math.sqrt(rs * rs - s.dot(s) * rr - rad)
return r.scalar((rs + int) / (rr -rad))
return r.scalar((rs - int) / (rr -rad))
}
