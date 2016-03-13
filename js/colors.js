var NC="\033[0m"; // No Color

var colors_code = {
	Black : "\033[0;30m",
	Dark_Gray : "\033[1;30m",
	Red : "\033[31m" ,
	Light_Red : "\033[1;31m",
	Green : "\033[32m",
	Light_Green : "\033[1;32m",
	Orange : "\033[0;33m",
	Yellow : "\033[1;33m",
	Blue : "\033[0;34m",
	Light_Blue : "\033[1;34m",
	Purple : "\033[0;35m",
	Light_Purple : "\033[1;35m",
	Cyan : "\033[0;36m",
	Light_Cyan : "\033[1;36m",
	Light_Gray : "\033[0;37m",
	White : "\033[1;37m"
}

exports.color = function(text,color){
	return colors_code[color] + text + NC;
}