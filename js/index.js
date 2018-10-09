window.onload = function() {

	// Drawer
	drawer = new mdc.drawer.MDCTemporaryDrawer(document.querySelector(".mdc-drawer--temporary"));

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

	menu = new mdc.menu.MDCMenu(document.querySelector(".mdc-menu"));

	// Verify if night mode is on or off
	nightMode("verify");
}

function listLanguagesOnDrawer() {

	// Empty the previous content of the language list
	$("#languagesDrawer").html("");

	// Get all data from data.yml
	$.get("assets/data.yml", function(data) {
		// Convert YAML data into JSON
		var yamlData = jsyaml.load(data);
		// For each data in json...
		$.each(yamlData, function(i) {
			// Append all the json commands on the sidebar from json
			$("#languagesDrawer").append(`
				<a onclick="addCommand('${yamlData[i].cmd_name}'); drawer.open = false" class="mdc-list-item mdc-list-item">
					<span class="mdc-list-item__text">
						<span class="mdc-list-item__primary-text"><span class="w3-codespan w3-round">${yamlData[i].cmd_name}</span></span>
						<span class="mdc-list-item__secondary-text">${yamlData[i].cmd_description}</span>
					</span>
				</a>
			`);
		})
	})
}

// Add a command from data.yml
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

					// Append the dialog to the page
					$("#pageContent").append(`
						<aside id="addCommandDialog" class="mdc-dialog" role="alertdialog">
							<div class="mdc-dialog__surface">

								<header class="mdc-dialog__header">
									<h2 id="dialog-title" class="mdc-dialog__header__title">
										Adicionar <span class='w3-codespan w3-round'>${yamlData[i].cmd_name}</span>
									</h2>
								</header>

								<section id="mdc-dialog-body" class="mdc-dialog__body"></section>

								<footer class="mdc-dialog__footer">
									<button id="btnOK" type="button" class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept">OK</button>
									<button onclick="$('#addCommandDialog').remove()" type="button" class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept">Cancelar</button>
								</footer>

							</div>
							<div class="mdc-dialog__backdrop"></div>
						</aside>
					`);

					// Remove all inputs on the dialog body
					$("#mdc-dialog-body").html("");

					// For each parameter in array
					$.each(yamlData[i].cmd_parameters, function(index) {
						// Verify the parameter type
						switch (yamlData[i].cmd_parameters[index].prm_type) {

							// If parameter type is input...
							case "input":
								$("#mdc-dialog-body").append(`
									<label>${yamlData[i].cmd_parameters[index].prm_label}</label>
									<input class='w3-input w3-border w3-round required' type='text'>
								`);
								break;

						}
					})

					// Turn the parameter dialog visible
					var dialogAddCommand = new mdc.dialog.MDCDialog(document.querySelector("#addCommandDialog"));
					dialogAddCommand.show();

					// Focus on the first input on the dialog
					$("#addCommandDialog input:text:visible:first").focus();

					// OK button is clicked...
					$("#btnOK").on("click", function() {
						parameters = [];

						// For each input on the parameter dialog...
						$.each($("#addCommandDialog input.required"), function(index) {

							// If there is any empty input...
							if (!$("#addCommandDialog input.required").eq(index).val()) {
								alert("Preencha todos os campos obrigatórios!");
								return false;
							}

							// Insert the value of input to array
							parameters.splice(index, 0, $("#addCommandDialog input.required").eq(index).val());

							// If all inputs are validated...
							if (index == $("#addCommandDialog input.required").length - 1) {
								
								// For each parameter in array...
								$.each(parameters, function(i2) {

									// Replace the cmd_parameter + index with the respective array value
									yamlData[i].cmd_codeblock = yamlData[i].cmd_codeblock.replace(new RegExp("cmd_parameter" + i2, "g"), parameters[i2]);
								})

								// Append the created code block
								$("#editArea").append(yamlData[i].cmd_codeblock);

								// Remove the dialog from the page
								$("#addCommandDialog").remove();

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

			}
		})
	})
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

// Switch between the list and code
function changeViewMode() {
	// Enable list mode
	if ($("#btnChangeView").text() == "code") {
		$("#code").css("display", "none");
		$("#list").css("display", "block");
		$("#btnChangeView").text("list");
	// Enable code mode
	} else {
		$("#list").css("display", "none");
		$("#code").css("display", "block");
		$("#btnChangeView").text("code");
	}
}

// Displays the "about" dialog
function aboutDialog() {
	$("body").append(`
		<aside id="aboutDialog" class="mdc-dialog" role="alertdialog">
			<div class="mdc-dialog__surface">

				<header class="mdc-dialog__header">
					<h2 id="dialog-title" class="mdc-dialog__header__title">
						Sobre o codeIDE
					</h2>
				</header>

				<section id="mdc-dialog-body" class="mdc-dialog__body">
					Uma IDE web com interface arrasta e solta.<br><br>
					<a href="https://github.com/henriquehbr/codeide" target="_blank">Visitar repositório no Github</a>
				</section>

				<footer class="mdc-dialog__footer">
					<button type="button" class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept">OK</button>
				</footer>

			</div>
			<div class="mdc-dialog__backdrop"></div>
		</aside>
	`);
	dialogAbout = new mdc.dialog.MDCDialog(document.querySelector("#aboutDialog"));
	dialogAbout.show();
}

// Removes a specific element
function remove(element) {
	$(element).parent().remove();
	list2code();
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
			// Disable night mode
			} else if (localStorage.getItem("night_mode") == "true") {
				localStorage.setItem("night_mode", "false");
				$("body").css("background-color", "transparent");
				$("#codeOutput").css("color", "black");
			}
		break;

		case "verify":
			// Verify if night mode is enabled
			if (localStorage.getItem("night_mode") == "true") {
				$("body").css("background-color", "#323232");
				$("#codeOutput").css("color", "white");
			// Verify if night mode is disabled
			} else if (localStorage.getItem("night_mode") == "false") {
				$("body").css("background-color", "transparent");
				$("#codeOutput").css("color", "black");
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

changeViewMode();

sortable();

list2code();

listLanguagesOnDrawer();