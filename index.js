// Append all the json commands on the sidebar from json
window.onload = function() {
	// Get all data from data.json
	$.getJSON("data.json", function(data) {
		// For each data in json...
		$.each(data, function(i) {
			// Outputs the item command name
			$("#page-sidebar").append(`
				<a onclick="addCommand('${data[i].cmd_name}')" class="w3-bar-item w3-button">${data[i].cmd_name}</a>
			`);
		})
	})
}

// Add a command from json
function addCommand(command) {
	// Get all data from data.json
	$.getJSON("data.json", function(data) {
		// For each item in json...	
		$.each(data, function(i) {
			// If data is equal the selected command
			if (data[i].cmd_name == command) {

				// Join all elements of the code block array
				codeblock_string = data[i].cmd_codeblock.join("");

				// If parameters array exists...
				if (data[i].cmd_parameters) {

					// Append the modal to the page
					$("#page-content").append(`
						<div id='modal' class='w3-modal'>
							<div class='w3-modal-content w3-card-4 w3-animate-top'>

								<header id="modal-header" class='w3-container w3-blue'>
									<span onclick='$("#modal").remove()' class='w3-button w3-display-topright'>&times;</span>
									<h2>Adicionar <span class='w3-codespan w3-round'>${data[i].cmd_name}</span></h2>
								</header>

								<div id="modal-body" class='w3-container w3-section'></div>

								<footer id="modal-footer" class='w3-container w3-blue'>
									<button id='btn-ok' class='w3-button w3-padding w3-right'>OK</button>
									<button onclick='$("#modal").remove()' class='w3-button w3-padding w3-right'>Cancelar</button>
								</footer>
							</div>
						</div>
					`);

					// For each parameter in array
					$.each(data[i].cmd_parameters, function(index) {
						// Verify the parameter type
						switch (data[i].cmd_parameters[index].prm_type) {

							// If parameter type is input...
							case "input":
								$("#modal-body").append(`
									<label>${data[i].cmd_parameters[index].prm_label}</label>
									<input class='w3-input w3-border w3-light-grey required' type='text'></input>
								`);
								break;

						}
					})

					// Turn the parameter modal visible
					$("#modal").css("display", "block");

					// OK button is clicked...
					$("#btn-ok").on("click", function() {
						parameters = [];

						// For each input on the parameter modal...
						$.each($("#modal input.required"), function(index) {

							// If there is any empty input...
							if (!$("#modal input.required").eq(index).val()) {
								alert("Preencha todos os campos obrigatórios!");
								return false;
							}

							// Insert the value of input to array
							parameters.splice(index, 0, $("#modal input.required").eq(index).val());

							// If all inputs are validated...
							if (index == $("#modal input.required").length - 1) {

								// For each parameter in array...
								$.each(parameters, function(i2) {
									// Replace the cmd_parameter + index with the respective array value
									codeblock_string = codeblock_string.replace(new RegExp("cmd_parameter" + i2, "g"), parameters[i2]);
								})

								// Append the created code block
								$("#editArea").append(codeblock_string);

								$("#modal").remove();

								// Transform the list created list into a sortable list
								sortable();

								// Convert the list items into indented text
								list2code();

								// Define the color scheme of the code blocks
								color_scheme("monokai");

							}
						})
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
	$("#page-sidebar").css("display", "block");
}

function close_sidebar() {
	$("#page-sidebar").css("display", "none");
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