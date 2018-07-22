function addCommand(command) {
	// Get all data from data.json
	$.getJSON("data.json", function(data) {
		// For each item in json	
		$.each(data, function(i) {
			// If data is equal the selected command
			if (data[i].cmd_name == command) {
				// Join all elements of the code block array
				codeblock_string = data[i].cmd_codeblock.join("");

				// If parameters array exists...
				if (data[i].cmd_parameter) {
					parameters = [];
					// For each parameter in command... (json object)
					$.each(data[i].cmd_parameter, function(i1) {
						// Push variable prompting the parameter value to array
						parameters.push(prompt(data[i].cmd_parameter[i1]));

						// Check if the parameter is null
						if (parameters[i1] == null) {
							return false;
						// Check if the parameter length is less than 1
						} else if (parameters[i1].length < 1) {
							alert("Valor inválido");
							return false;
						} else if ( i1 == data[i].cmd_parameter.length - 1) {
							// For each parameter in array...
							$.each(parameters, function(i2) {
								// Replace the [[cmd_parameter + index]] with the respective array value
								codeblock_string = codeblock_string.replace(new RegExp("cmd_parameter" + i2, "g"), parameters[i2]);
							})
							
							// Append the created code block
							$("#editArea").append(codeblock_string);
						}
					})
				} else {
					$("#editArea").append(codeblock_string);
				}

				// Transform the list created list into a sortable list
				sortable();

				// Convert the list items into indented text
				list2code();

				// Define the color scheme of the code blocks
				color_scheme("monokai");

				close_sidebar();

			}
		})
	})
}

function open_sidebar() {
	$("#sidebar").css("display", "block");
}

function close_sidebar() {
	$("#sidebar").css("display", "none");
}

// Transform all the lists into sortable lists
function sortable() {
	// For each list in page...
	for (var i=0; i < $(".list").length; i++) {
		// Transform the list into a sortable list
		var sortable = Sortable.create($(".list")[i], {
			group: "editor",
			pull: true,
			put: true,
			draggable: ".sortable",
			animation: 150,

			// Event when you move an item in the list or between lists
			onMove: function (evt, originalEvent) {
				list2code();
			},

			// Called by any change to the list
			onSort: function (evt) {
				list2code();
			}
		});
	}
}

// Switch between the tabs
function openTab(tabName) {
	for (var i = 0; i < $(".tab").length; i++) {
		$(".tab").eq(i).css("display", "none");
	}
	$(tabName).css("display", "block");
}

// Open the list tab
openTab("#list");

// Transform all the lists into sortable lists
sortable();

// Convert the list items into indented text
list2code();

// Define the color scheme of the commands
function color_scheme(color_scheme) {
	switch (color_scheme) {
		case "monokai":

			// Set the alert() color
			$(".cmd_alert").css({
				"background-color": "#66d9ef",
				"color": "white"
			});

			// Set the if/else statement color
			$(".cmd_if, .cmd_else, .cmd_for").css({
				"background-color": "#f92672",
				"color": "white"
			});

			break;
	}
}

// Create a for statement
function cmd_for() {
	var firstConditional = prompt("Digite a primeira condição:");
	// Check if the first value is valid
	if (firstConditional == null) {
		return;
	} else if (firstConditional.length < 1) {
		return alert("Valor inválido");
	}

	var secondConditional = prompt("Digite a segunda condição:");
	// Check if the second value is valid
	if (firstConditional == null) {
		return;
	} else if (secondConditional.length < 1) {
		return alert("Valor inválido");
	}

	var thirdConditional = prompt("Digite a terceira condição:");
	// Check if the third value is valid
	if (firstConditional == null) {
		return;
	} else if (thirdConditional.length < 1) {
		return alert("Valor inválido");
	}

	$("#editArea").append(`
		<ul class="w3-card w3-padding w3-margin-bottom cmd_for sortable">
			<a class="close w3-right" onclick="remove(this)">X</a>
			<span class="visual">Para (<span class="visual">${firstConditional}; ${secondConditional}; ${thirdConditional}</span>) então...</span>
			<span class="code">for (${firstConditional}; ${secondConditional}; ${thirdConditional}) {</span>

			<ul class="list sortable"></ul>

			<span class="visual">}</span>
			<span class="code">}</span>
		</ul>
	`);

	// Transform the list created list into a sortable list
	sortable();

	// Convert the list items into indented text
	list2code();

	// Define the color scheme of the commands
	color_scheme("monokai");

	close_sidebar();
}

// Removes a specific element
function remove(element) {
	$(element).parent().remove();
}

// Convert the list items into indented text
function list2code() {

	// Clear the code output
	$("#codeOutput").html("");

	// For each span with code class...
	$.each($("span.code"), function() {

		tabQty = [];
		// If the item has any parents
		if ($(this).parents(".list").length) {
			// For each parent of the actual item...
			$.each($(this).parents(".list"), function() {
				// Adds a tab character to the tabQty array
				tabQty.push("\t");
			});

			// Remove one tab character from the tabQty array (bug fixing)
			tabQty.splice(tabQty.indexOf("\t"), 1);
			// Show the indented line of code (with tabs)
			$("#codeOutput").append(tabQty.join("") + $(this).text() + "\n");
		} else {
			// Show the indented line of code
			$("#codeOutput").append($(this).text() + "\n");
		}

	});
}