var NC="\033[0m"; // No Color

var colors_code = {
	black : "\033[0;30m",
	dark_gray : "\033[1;30m",
	red : "\033[31m" ,
	light_red : "\033[1;31m",
	green : "\033[32m",
	light_green : "\033[1;32m",
	orange : "\033[0;33m",
	yellow : "\033[1;33m",
	blue : "\033[0;34m",
	light_blue : "\033[1;34m",
	purple : "\033[0;35m",
	light_purple : "\033[1;35m",
	cyan : "\033[0;36m",
	light_cyan : "\033[1;36m",
	light_gray : "\033[0;37m",
	white : "\033[1;37m"
}

exports.color = function(text,color){
	var colorcode = colors_code[color.toLowerCase()] || ''; 
	return colorcode + text + NC;
}

exports.bold = function(text){
	return '\x1B[1m'+ text +'\x1B[0m';
}