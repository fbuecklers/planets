schnitt: Function (r, s, rad) {
return p1 = (r.dot(s) + Math.sqrt(r.dot(s) * r.dot(s) - s.dot(s) *(r.dot(r) - rad)) / (r.dot(r)-rad)
return p2 = (r.dot(s) - Math.sqrt(r.dot(s) * r.dot(s) - s.dot(s) *(r.dot(r) - rad)) / (r.dot(r)-rad)
}
