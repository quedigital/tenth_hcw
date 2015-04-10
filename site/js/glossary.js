define([], function () {

	var Glossary = {};
	
	var initialized = false;
	
	Glossary.terms = {
		"accelerated graphics port (AGP)": "An expansion slot that gives a video card fast access to bitmap stores in a PC's main RAM. This slot has quickly lost ground to the PCI-Express slot.",
		"address line": "An electrical line, or circuit, associated with a specific location in RAM.",
		"ADSL": "Asymmetric Digital Subscriber Line: Modems attached to twisted pair copper wiring that transmit from 1.5Mbps to 9Mbps downstream (to the subscriber) and from 16Kbps to 800Kbps upstream, depending on line distance.",
		"algorithm": "A procedure, rule, or formula for solving a problem. A computer program is essentially an elaborate algorithm that goes through a series of steps to arrive at a specific outcome.",
		"Analog": "An analog signal is a continuous, varying electrical output, such as those created by microphones and sound amplifiers. Contrast to digital.",
		"analog-to-digital converter (ADC) ": "A chip that converts an analog signal to digital values that a PC can manipulate.",
		"application": "Software the performs a specific function that is the end result of using the computer. Word processors, database programs, Web browsers, and image-editing programs are all applications.",
		"applications": "application",
		"arithmetic logic unit (ALU)": "The central part of a microprocessor that manipulates the data received by the processor.",
		"backbone": "The highest speed Internet or network routes, off which branch regional and local networks that make up the body of the Internet.",
		"bandwidth": "Generally, the same as data transfer rate but also specifically the number of bits that can be sent through a network connection, measured in a second (bps); and the range of transmission frequencies a device can use, measured in Hertz (Hz) or cycles per second.",
		"BIOS": "A collection of software codes built into a PC that handle some of the fundamental tasks of sending data from one part of the computer to another.",
		"BIOS (basic input/output system)": "BIOS",
		"bitmap": "A graphic file that contains a record of the color value of each pixel in the graphic.",
		"Bridges": "Devices that connect a local area network (LAN) to another local area network that uses the same protocol\u2013for example, Ethernet to Ethernet or token ring to token ring.",
		"broadband": "A term for high-speed, high-capacity Internet and data connections.",
		"cache": "A block of high-speed memory where data is copied when it is retrieved from RAM. Then, if the data is needed again, it can be retrieved from the cache faster than from RAM. A Level 1 cache is located on the CPU die. A Level 2 is either a part of the processor die or packaging.",
		"capacitance": "A measure of the charge between two electrical plates that are separated by a non-conductive dialectic material. Because capacitance changes depending on the proximity, shape, and size of the plates, dialectic and even nearby object capacitance often is used to measure input.",
		"capacitor": "A component that stores an electrical charge.",
		"capacitors": "see:capacitor",
		"Capacitors": "see:capacitor",
		"capacitors": "see:capacitor",
		"CCD (charged coupled device)": "Miniature devices that convert the energy from light into electrical current. CCDs are used in digital cameras and scanners.",
		"channels": "Transmission paths between two points. Channel usually refers to a one-way path, but when paths in the two directions of transmission are always associated, the term channel can refer to this two-way path.",
		"circuit board": "Originally, wires ran from and to any component in any electrical device, not just computers. A circuit board replaces the need for separate wiring with the metallic traces printed on the board\u2013sometimes also on the bottom of the board and in a hidden middle layer. The traces lead to connections for processors, resistors, capacitors, and other electrical components. The importance of the circuit board is that its entire creation can be automated, and the board packs more components into an ever-smaller space.",
		"clock cycle": "A microchip regulates the timing and speed of all a computer's functions. The chip includes a crystal that vibrates at a certain frequency when electricity is applied to it. The shortest length of time in which a computer can perform some operation is one click, or one vibration of the clock chip, a clock cycle. The speed of clocks\u2013and therefore, computers\u2013is expressed in megahertz (MHz). One megahertz is 1 million cycles, or vibrations, a second. Thus, a PC can be described as having a 200 or 300 MHz processor, which means that the processor has been designed to work with a clock chip running at that speed.",
		"CMOS": "An acronym for complementary metaloxide semiconductor\u2013a term that describes how a CMOS microchip is manufactured. Powered by a small battery, the CMOS chip retains crucial information about what hardware a PC comprises even when power is turned off.",
		"CMOS (complementary metal oxide semiconductor)": "see:CMOS",
		"compiler": "A software tool that converts source code into a format that can run only with the assistance of an operating system. Contrast with interpreter.",
		"complex instruction set computing (CISC)": "A processor architecture design in which large, complicated instructions are broken down into smaller tasks before the processor executes them. See: reduced instruction set computing.",
		"CPU": "An acronym for central processing unit, it is used to mean the microprocessor\u2013also, processor\u2013which is a microchip that processes the information and the code (instructions) used by a computer. The \"brains\" of a computer.",
		"Cyclic Redundancy Check (CRC)": "A process used to detect missing or erroneous data. When data is sent, a special check number (CRC) is calculated, based on the data itself, and stored with it. As data is received, the CRC is recalculated and compared with the stored CRC. The two match if no errors are present.",
		"CYMK": "Cyan, yellow, magenta, and black (K)\u2013the four colors most often used in color printing.",
		"data line": "An electrical line, or circuit, that carries data; specifically in RAM chips, a circuit that determines whether a bit represents a 0 or a 1.",
		"digital subscriber lines": "Digital Subscriber Line (DSL) technology provides a dedicated digital circuit between a residence and a telephone company's central office, allowing high-speed data transportation over existing twisted copper telephone lines.",
		"digital-to-analog converter": "A chip that converts a series of digital values into a smoothly varying analog electrical current.",
		"digital-to-analog converter (DAC)": "see:digital-to-analog convert",
		"digital-to-analog converter (DAC)": "see:digital-to-analog convert",
		"Distributed structure": "A network in which crucial files are spread across several servers. This eases the demand that would be made on a single server while safeguarding data, because information is stored on multiple servers, usually overlapping so that all data is available in its entirety even if one or more of the servers crashes.",
		"dot pitch": "The distance between the nearest two pixels of the same color. Smaller is better.",
		"dot-matrix printer": "A printer that uses the grid of horizontal and vertical dots that make up all the possible dots\u2013most often as many as 900,000\u2013that could be included in the bitmap of a single character.",
		"Downstream data": "Refers to \"host to end-user\" (receive, download) direction.",
		"drain": "The part of a transistor where electrical current flows out when it is closed.",
		"firewall�": "A security device that controls access from the Internet to a local network.",
		"full-adders": "Differing combinations of transistors perform mathematical and logical operations on data being processed.",
		"gate": "A microcircuit design in which transistors are arranged so the value of a bit of data can be changed.",
		"Gateways": "A gateway is hardware and software that link two networks that work differently.",
		"half-adders": "Differing combinatons of transistors perform mathematical and logical operations on data being processed.",
		"high-level language": "Software code written with recognizable words that more closely resemble conventional languages, such as English. Contrast with low-level languages.",
		"Hubs": "A hub is a device where various computers on a network or networks on the Internet connect.",
		"impact printer": "A printer that uses a quick blow to press ink from a ribbon onto paper.",
		"input/output": "Input is data flowing into a device; output is data flowing out. Note that one device's output is another's input. You can't have one without another.",
		"Internet protocol (IP) ": "A format for contents and addresses of packets of information sent over the Net. Part of TCP/IP.",
		"interpreter": "A software tool that converts source code on the fly into instructions the computer can understand. Contrast with compiler.",
		"IP": "see:Internet protocol (IP)",
		"IP (Internet protocol)�": "see:Internet protocol (IP)",
		"IP address": "An identifier for a computer or device on a TCP/IP network. Networks using the TCP/IP protocol route messages based on the IP address of the destination. The format of an IP address is a 32-bit numeric address written as four numbers separated by periods. Each number can be zero to 255.",
		"low-level machine language": "Software code written with specialized words that bear little resemblance to ordinary language but which requires less interpretation or compilation to create a finished program.",
		"megahertz": "A measurement, in millions, of the number of times something oscillates or vibrates. Processor speeds are normally measured in gigahertz (GHz).",
		"microprocessor": "The \"brains\" of a computer. A component that contains circuitry that can manipulate data in the form of binary bits. A microprocessor is contained on a single microchip.",
		"microprocessors": "see:microprocessor",
		"multi-threaded": "A type of program designed to take advantage of a processor's ability to execute more than one string of data\u2013thread\u2013at the same time. Multi-threaded programs must be designed so the threads can run independently and will not interfere with each other.",
		"operating system (OS)": "Software that exists to control the operations of hardware. Essentially, the operating system directs any operation, such as writing data to memory or to disk, and regulates the use of hardware among several application programs that are running at the same time. This frees program developers from having to write their own code for these mos basic operations.",
		"peer-to-peer ": "A network in which there is no central server. All devices on the network are peers and can perform the duties of a host and client at the same time.",
		"pixels": "Derived from \"picture element\"\u2013the smallest unit of a computer display. A physical pixel equals the physical size of the dot pitch and consists of only one dot each of red, blue, and green. Several physical pixels can go into making up one logical pixel, the smallest grouping of color dots that a video card works with as if they were single point of light.",
		"plain old telephone system (POTS) ": "Basic analog telephone service with no frills from digital technology.",
		"polarized": "Light is ordinarily non-polarized. That means on a straight line leading away from a light source, light waves will be vibrating at all angles to the line. Polarization happens when light passes through a filter that permits the light waves to pass only if their plane of vibration is within a limited range.",
		"polarizing filter": "see:polarized",
		"ports": "Generally, a specific place where one device, usually represented by a cable or wire, is physically connected to some other device through a socket or slot. In a broader sense, any point at which data is transferred.",
		"rasterization": "The process of translating the 3D geometry of 3D objects to a two-dimensional bitmap that can be displayed on the screen.",
		"reduced instruction set computing (RISC)": "A processor design in which only small, quickly executing instructions are used. Contrast to complex instruction set computing.",
		"redundancy": "An arrangement of several copies of the same data or service that act as if they were a single source. Redundancy is designed to protect against the failure of a single point or to improve performance.",
		"register": "A set of transistors in a processor where data is stored temporarily while the processor makes calculations involving that data\u2013a sort of electronic scratch pad.",
		"registers": "see:register",
		"router": "A device that routes data between networks using IP addressing. Routers provide firewall security.",
		"semiconductors": "A material (such as silicon) that can be altered to either conduct electrical current or block its passage. Microchips are typically fabricated on semiconductor materials such as silicon, germanium, or gallium arsenide.",
		"server": "Part of a network that supplies files and services to clients. A file server is dedicated to storing files, and a print server provides printing for many PCs. A mail server handles mail within a network with the Internet.",
		"shader": "Plug-in code for graphics rendering software that defines the final surface properties of an object. Originally, shaders computed only surface shading, but the name stuck as new shaders were invented that had nothing to do with shading. For example, a shader can define the color, reflectivity, and translucency of a surface.",
		"shaders": "see:shader",
		"silicon chip": "A semiconductor wafer made from silicon, a brownish crystalline semimetal.",
		"source": "The part of a transistor from which electrical current flows when the transistor is closed.",
		"streaming video": "Sending video and audio transmission in real time over a network or the Internet.",
		"switch": "A device that provides communication channels among end-users. A circuit switch provides dedicated paths.",
		"throughput": "The amount of work a computer or component can do in a specific amount of time.",
		"transistor": "A microscopic switch that controls the flow of electricity through it, depending on whether a different electrical charge has opened or closed the switch.",
		"transistors": "see:transistor",
		"Transmission Control Protocol/Internet Protocol (TCP/IP)": "Transmission Control Protocol/Internet Protocol; actually a collection of methods used to connect servers on the Internet and to exchange data. TCP/IP is a universal standard for connecting to the Net.",
		"wide-area network (WAN)": "A single network that extends beyond the boundaries of one office or building.",
		"write": "Writing is the process by which a computer stores data in either RAM chips or on a disk drive. Reading is the process by which a computer transfers data or software code from a drive to RAM or from RAM to the microprocessor.",
	};
	
	function initialize () {
		var key, keys = Object.keys(Glossary.terms);
		var n = keys.length;
		var newobj = {};
		while (n--) {
			key = keys[n];
			newobj[key.toLowerCase()] = Glossary.terms[key];
		}
		Glossary.terms = newobj;
		
		initialized = true;
	}
	
	Glossary.getDefinition = function (term) {
		if (!initialized) initialize();
		
		var def = this.terms[term.toLowerCase()];
		
		if  (def) {
			// cross-reference to another term
			if (def.indexOf("see:") == 0) {
				def = this.terms[def.substr(4).toLowerCase()];
			}
		}
		
		return def;
	}
	
	return Glossary;
});