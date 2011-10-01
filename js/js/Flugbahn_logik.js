schnitt: Function (r, s, rad) {
var rs = r.dot(s)
var rr = r.dot(r)
var int = Math.sqrt(rs * rs - s.dot(s) * rr - rad)
return t1 = (rs + int) / (rr -rad)
return t2 = (rs - int) / (rr -rad)
}
