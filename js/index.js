window.onload = function() {

	// Get all data from data.yml
	$.get("assets/data.yml", function(data) {
		// Convert YAML data into JSON
		var yamlData = jsyaml.load(data);
		// For each data in json...
		$.each(yamlData, function(i) {
			// Append all the json commands on the sidebar from json
			$("#page-sidebar").append(`
				<a onclick="addCommand('${yamlData[i].cmd_name}')" class="w3-bar-item w3-button">${yamlData[i].cmd_name}</a>
			`);
		})
	})

	// Verify if browser supports Web Storage
	if (typeof(Storage) !== "undefined") {
		console.log("Your browser supports Web Storage");
	} else {
		console.log("Your browser doesn't support Web Storage!");
	}

	// Create "night_mode" on localStorage (if not exists)
	if (localStorage.getItem("night_mode") == null) {
		localStorage.setItem("night_mode", "false");
	}

	// Verify if night mode is on or off
	nightMode("verify");
}

// Add a command from json
function addCommand(command) {
	// Get all data from data.yml
	$.get("assets/data.yml", function(data) {
		// Convert YAML data into JSON
		var yamlData = jsyaml.load(data);
		// For each item in json...	
		$.each(yamlData, function(i) {
			// If data is equal the selected command
			if (yamlData[i].cmd_name == command) {

				// If parameters array exists...
				if (yamlData[i].cmd_parameters) {

					// Append the modal to the page
					$("#page-content").append(`
						<div id='modal' class='w3-modal'>
							<div class='w3-modal-content w3-card-4 w3-animate-top'>

								<header id="modal-header" class='w3-container w3-blue'>
									<span onclick='$("#modal").remove()' class='w3-button w3-display-topright'>&times;</span>
									<h2>Adicionar <span class='w3-codespan w3-round'>${yamlData[i].cmd_name}</span></h2>
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
					$.each(yamlData[i].cmd_parameters, function(index) {
						// Verify the parameter type
						switch (yamlData[i].cmd_parameters[index].prm_type) {

							// If parameter type is input...
							case "input":
								$("#modal-body").append(`
									<label>${yamlData[i].cmd_parameters[index].prm_label}</label>
									<input class='w3-input w3-border w3-light-grey required' type='text'></input>
								`);
								break;

						}
					})

					// Turn the parameter modal visible
					$("#modal").css("display", "block");

					$("#modal input:text:visible:first").focus();

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
									yamlData[i].cmd_codeblock = yamlData[i].cmd_codeblock.replace(new RegExp("cmd_parameter" + i2, "g"), parameters[i2]);
								})

								// Append the created code block
								$("#editArea").append(yamlData[i].cmd_codeblock);

								$("#modal").remove();

								// Transform the list created list into a sortable list
								sortable();

								// Convert the list items into indented text
								list2code();

							}
						})
					})

				} else {
					$("#editArea").append(yamlData[i].cmd_codeblock);
				}

				// Transform the list created list into a sortable list
				sortable();

				// Convert the list items into indented text
				list2code();

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

	// Transform every list into a sortable list
	$("ul.list").sortable({
		onDrop: function ($item, container, _super) {
			list2code();
			_super($item, container);
		}
	});

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

// Removes a specific element
function remove(element) {
	$(element).parent().remove();
}

// Open and close menu dropdown
function triggerDropdown() {
	var x = document.getElementById("dropdown-menu");
	if (x.className.indexOf("w3-show") == -1) {
		x.className += " w3-show";

	} else {
		x.className = x.className.replace(" w3-show", "");
	}
}

// Enable, disable or verify night mode state
function nightMode(action) {
	switch (action) {
		case "trigger":
			// Enable night mode
			if (localStorage.getItem("night_mode") == "false") {
				localStorage.setItem("night_mode", "true");
				$("body").css("background-color", "#323232");
				$("#codeOutput").css("color", "white");
				$("#dropdown-menu").css({
					"background-color": "#323232",
					"color": "white"
				});
				$("#page-sidebar").css({
					"background-color": "#323232",
					"color": "white"
				});
			// Disable night mode
			} else if (localStorage.getItem("night_mode") == "true") {
				localStorage.setItem("night_mode", "false");
				$("body").css("background-color", "transparent");
				$("#codeOutput").css("color", "black");
				$("#dropdown-menu").css({
					"background-color": "white",
					"color": "black"
				});
				$("#page-sidebar").css({
					"background-color": "white",
					"color": "black"
				});
			}
		break;

		case "verify":
			// Verify if night mode is enable
			if (localStorage.getItem("night_mode") == "true") {
				$("body").css("background-color", "#323232");
				$("#codeOutput").css("color", "white");
				$("#dropdown-menu").css({
					"background-color": "#323232",
					"color": "white"
				});
				$("#page-sidebar").css({
					"background-color": "#323232",
					"color": "white"
				});
			// Verify if night mode is disabled
			} else if (localStorage.getItem("night_mode") == "false") {
				$("body").css("background-color", "transparent");
				$("#codeOutput").css("color", "black");
				$("#dropdown-menu").css({
					"background-color": "white",
					"color": "black"
				});
				$("#page-sidebar").css({
					"background-color": "white",
					"color": "black"
				});
			}
		break;
	}
}

// Convert the list items into indented text
function list2code() {

	// Clear the code output
	$("#codeOutput").html("");

	// For each span with code class...
	$.each($("span.code"), function() {

		tabQty = [];
		// If the item has any parents
		if ($(this).parents("ul").length) {
			// For each parent of the actual item...
			$.each($(this).parents("ul"), function() {
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
