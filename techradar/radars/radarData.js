//This is the title for your window tab, and your Radar
document.title = "Build Your Own Radar(2016.11)";


var radar_arcs = [
	{'r':100,'name':'Adopt'}     // well proven, safe choice
	,{'r':200,'name':'Trial'} // worked on small example, known good, does it meet our needs?
	,{'r':300,'name':'Assess'}  // new ideas on the periphery we should investigate and assess 
];

//This is your raw data
//
// Key
//
// movement:
//   t = moved
//   c = stayed put
//
// blipSize: 
//  intValue; This is optional, if you omit this property, then your blip will be size 70.
//            This give you the ability to be able to indicate information by blip size too
//
// url:
// StringValue : This is optional, If you add it then your blips will be clickable to some URL
//
// pc: polar coordinates
//     r = distance away from origin ("radial coordinate")
//     - Each level is 100 points away from origin
//     t = angle of the point from origin ("angular coordinate")
//     - 0 degrees is due east
//
// Coarse-grained quadrants
// - Techniques: elements of a software development process, such as experience design; and ways of structuring software, such micro-services.
// - Tools: components, such as databases, software development tools, such as versions control systems; or more generic categories of tools, such as the notion of polyglot persistance.
// - Platforms: things that we build software on top of: mobile technologies like Android, virtual platforms like the JVM, or generic kinds of platforms like hybrid clouds
// - Programming Languages and Frameworks
//
// Rings:
// - Adopt: blips you should be using now; proven and mature for use
// - Trial: blips ready for use, but not as completely proven as those in the adopt ring; use on a trial basis, to decide whether they should be part of your toolkit
// - Assess: things that you should look at closely, but not necessarily trial yet - unless you think they would be a particularly good fit for you
// - Hold: things that are getting attention in the industry, but not ready for use; sometimes they are not mature enough yet, sometimes they are irredeemably flawed
//      Note: there's no "avoid" ring, but throw things in the hold ring that people shouldn't use.

var h = 1000;
var w = 1200;

var makeCoords = function(depth, angle) {
	return {
		"r": depth,
		"t": angle
	};
}

var Quadrants = {
	Languages:  0,
	Techniques: 90,
	Tools:      180,
	Platforms:  270
};

var offset = function(base) {
	return function(ness) { return base + (100 - ness/100*100); };
};

var jfdi = function(ness) {
	return offset(0)(ness);
};

var validate = function(ness) {
	return offset(100)(ness);
};

var explore = function(ness) {
	return offset(200)(ness);
};

var kill = function(ness) {
	return offset(300)(ness);
};

var element = function(name, depth, baseAngle, percentageAngle, url) {
	var result = {
		"name": name,
		"pc":   makeCoords(depth,baseAngle + (90 * percentageAngle / 100))
	};

	if (url) {
		result["url"] = url;
	}

	return result;
}

var techniques = function(name,depth,position,url) {
	return element(name, depth, Quadrants.Techniques, position, url);
};

var languages = function(name,depth,position,url) {
	return element(name, depth, Quadrants.Languages, position, url);
};

var tools = function(name,depth,position,url) {
	return element(name, depth, Quadrants.Tools, position, url);
};

var platforms = function(name,depth,position,url) {
	return element(name, depth, Quadrants.Platforms, position, url);
};

var radar_data = [
	{ "quadrant": "Techniques",
		"left" : 45,
		"top" : 18,
		"color" : "#8FA227",
		"items" : [ 
			{"name":"Consumer-driven contract testing", "pc":{"r":50,"t":160},"movement":"c"},

			{"name":"Unikernels", "pc":{"r":250,"t":140},"movement":"t"},
			{"name":"Reactive architectures", "pc":{"r":180,"t":140},"movement":"c"},
			{"name":"Serverless architecture", "pc":{"r":170,"t":120},"movement":"c"},
			{"name":"Micro Frontends", "pc":{"r":220,"t":120},"movement":"t"},
			{"name":"Client-directed query", "pc":{"r":240,"t":130},"movement":"t"},
			{"name":"Reactive architectures", "pc":{"r":230,"t":110},"movement":"t"},

		]
	},
	{ "quadrant": "Platform", 
		"left": w-200+30,
		"top" : 18,
		"color" : "#587486",
		"items" : [ 
			{"name":"Docker", "pc":{"r":70,"t":40},"movement":"c"},

			{"name":"Rancher", "pc":{"r":170,"t":80},"movement":"t"},
			{"name":"Kubernetes", "pc":{"r":130,"t":40},"movement":"c"},
			{"name":"Apache Mesos", "pc":{"r":150,"t":60},"movement":"t"},

			{"name":"Electron", "pc":{"r":220,"t":20},"movement":"c"},
			{"name":"InianStack", "pc":{"r":230,"t":40},"movement":"t"},
			{"name":"Blockchain", "pc":{"r":250,"t":60},"movement":"t"},
			{"name":"Apache Flink", "pc":{"r":220,"t":80},"movement":"t"},
			{"name":"Nomad", "pc":{"r":240,"t":30},"movement":"c"},
			{"name":"Tarantool", "pc":{"r":260,"t":70},"movement":"t"},
		]
	},
	{ "quadrant": "Tools", 
		"left" :45,
		"top" : (h/2 + 18),
		"color" : "#DC6F1D",
		"items" : [
			{"name":"Babel", "pc":{"r":40,"t":240},"movement":"c"},   
			{"name":"Consul", "pc":{"r":60,"t":220},"movement":"c"},   
			{"name":"Packer", "pc":{"r":80,"t":260},"movement":"t"},   
			{"name":"Gatling", "pc":{"r":30,"t":200},"movement":"c"},   

			{"name":"Axios", "pc":{"r":110,"t":210},"movement":"t"},   
			{"name":"Zipkin", "pc":{"r":180,"t":230},"movement":"c"},   
			{"name":"Webpack", "pc":{"r":160,"t":250},"movement":"c"},   
			{"name":"Apache Kafka", "pc":{"r":120,"t":220},"movement":"c"},   
			{"name":"Terraform", "pc":{"r":140,"t":210},"movement":"t"},   

			{"name":"BotteledWater", "pc":{"r":240,"t":210},"movement":"t"},   
			{"name":"LambdaCD", "pc":{"r":260,"t":250},"movement":"t"},   
		]
	},
	{ "quadrant": "Languages",
		"color" : "#B70062",
		"left"  : (w-200+30),
		"top" :   (h/2 + 18),
		"items" : [ 
			{"name":"React.js", "pc":{"r":80,"t":300},"movement":"c"},   

			{"name":"Immutable.js", "pc":{"r":150,"t":280},"movement":"c"},   

			{"name":"Auerlia", "pc":{"r":220,"t":300},"movement":"t"},   
			{"name":"ECMAScript 2017", "pc":{"r":240,"t":320},"movement":"t"},   
			{"name":"Elm", "pc":{"r":260,"t":340},"movement":"t"},   
			{"name":"GraphicQL", "pc":{"r":280,"t":330},"movement":"c"},   
			{"name":"Recharts", "pc":{"r":220,"t":330},"movement":"c"},   
			{"name":"Three.js", "pc":{"r":270,"t":290},"movement":"c"},   
		]
	}
];
