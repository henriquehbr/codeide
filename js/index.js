function initMDCElements() {

	// Enable MDC on all inputs
	mdc.autoInit(document, () => {});

	// Menu
	menu = new mdc.menu.MDCMenu(document.querySelector(".mdc-menu"));
}

$(document).ready(() => {
	/* Turn page visible and enable user interaction after loading page */
	$("html").css({
		"pointer-events": "all",
		"visibility": "visible",
		"opacity": "1"
	});

	// Verify if browser supports Web Storage
	if (typeof(Storage) !== "undefined") {
		console.log("[OK] Your browser supports Web Storage");

		// Create "night_mode" on localStorage (if not exists)
		if (localStorage.getItem("night_mode") == null) {
			localStorage.setItem("night_mode", "false");
		}

		// Verify if night mode is on or off
		nightMode("verify");
	} else {
		console.log("[FAIL] Your browser doesn't support Web Storage!");
	}

	// Verify if browser supports File Reader API
	if (window.File || window.FileReader || window.FileList || window.Blob) {
		console.log("[OK] Your browser support File API's");
	} else {
		console.log("[FAIL] Your browser doesn't support File API's");
	}

	changeViewMode();
	makeListsSortable();
	convertBlocksToCode();
	initMDCElements();
});

// Add a command from data.yml
function addCommand(command) {

	// Get all data from data.yml
	$.get("assets/data.yml", function(data) {

		// Convert YAML data into JSON
		var convertYamlToJson = jsyaml.load(data);

		// For each item in json...	
		$.each(convertYamlToJson, function(i) {

			// If data is equal the selected command
			if (convertYamlToJson[i].cmd_name == command) {

				// If parameters array exists...
				if (convertYamlToJson[i].cmd_parameters) {
					displayDialog("addCommandDialog", `Adicionar <span class="w3-codespan w3-round">${convertYamlToJson[i].cmd_name}</span>`, null, `
						<button id="btnOK" type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes">OK</button>
						<button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="no">Cancelar</button>
					`);

					// Remove all inputs on the dialog body
					$(".mdc-dialog__content").html("");

					// For each parameter in array
					$.each(convertYamlToJson[i].cmd_parameters, function(index) {

						// Verify the parameter type
						switch (convertYamlToJson[i].cmd_parameters[index].prm_type) {

							// If parameter type is input...
							case "input":
								$(".mdc-dialog__content").append(`
									<div class="mdc-text-field mdc-text-field--outlined w3-margin-top" data-mdc-auto-init="MDCTextField">
										<input autocomplete="off" type="text" id="tf-outlined" class="mdc-text-field__input">
										<label for="tf-outlined" class="mdc-floating-label">${convertYamlToJson[i].cmd_parameters[index].prm_label}</label>
										<div class="mdc-notched-outline">
											<svg>
												<path class="mdc-notched-outline__path" />
											</svg>
										</div>
										<div class="mdc-notched-outline__idle"></div>
									</div>
								`);
								break;

						}
					});

					initMDCElements();

					// Focus on the first input on the dialog
					$("#addCommandDialog input:first").focus();

					// OK button is clicked...
					$("#btnOK").on("click", function() {
						parameters = [];

						// For each input on the parameter dialog...
						$.each($("#addCommandDialog input"), function(index) {

							// Insert the value of input to array
							parameters.splice(index, 0, $("#addCommandDialog input").eq(index).val());

							// If all inputs are validated...
							if (index == $("#addCommandDialog input").length - 1) {

								cmdCodeBlock = $(convertYamlToJson[i].cmd_codeblock);

								// For each parameter in array...
								$.each(parameters, function(i2) {
									// Replace the editable value on block with the respective array value
									cmdCodeBlock.find(".block .editable").eq(i2).text(parameters[i2]);

									// Replace the editable value on code with the respective array value
									cmdCodeBlock.find(".code .editable").eq(i2).text(parameters[i2]);
								});

								// Append the created code block
								$("#editArea").append(cmdCodeBlock);

								// Transform the list created list into a sortable list
								makeListsSortable();

								// Convert the list items into indented text
								convertBlocksToCode();

							}
						});
					});

				} else {
					$("#editArea").append(convertYamlToJson[i].cmd_codeblock);
				}

				// Transform the list created list into a sortable list
				makeListsSortable();

				// Convert the list items into indented text
				convertBlocksToCode();

			}
		});
	});
}

// Transform all the lists into sortable lists
function makeListsSortable() {
	// Transform every list into a sortable list
	$("ul.list").sortable({
		handle: "i.drag",
		onDrag: function() {
			$("html").css("overflow-y", "hidden");
			if ($("li.placeholder")[0].getBoundingClientRect().top >= $(".scrollDiv")[0].getBoundingClientRect().top) {
				window.scrollBy(0, 20);
			} else if ($("li.placeholder")[0].getBoundingClientRect().top <= $(".mdc-top-app-bar")[0].getBoundingClientRect().height) {
				window.scrollBy(0, -20);
			}
		},
		onDrop: function($item, container, _super) {
			convertBlocksToCode();
			_super($item, container);
			$("html").css("overflow-y", "auto");
		}
	});
}

// Switch between blocks and code
function changeViewMode() {
	// Enable list mode
	if ($("#btnChangeView").text() == "code") {
		$("#code").css("display", "none");
		$("#list").css("display", "block");
		$("#btnChangeView").text("view_list");
		// Enable code mode
	} else if ($("#btnChangeView").text() == "view_list") {
		$("#list").css("display", "none");
		$("#code").css("display", "block");
		$("#btnChangeView").text("code");
	}
}

function displayAboutDialog() {
	displayDialog("aboutDialog", "Sobre o codeIDE", `
		Uma IDE web com uma interface arrasta e solta, desenvolvido para a 1º Mostra Ciêntifica do IFTO Campus Palmas<br><br>
		<a href="https://github.com/henriquehbr/codeide" target="_blank">
			<i class="fab fa-github"></i><span class="mdc-list-item__text"> Visitar repositório no Github</span>
		</a><br>
		<a href="https://patreon.com/henriquehbr" target="_blank">
			<i class="fab fa-patreon"></i><span class="mdc-list-item__text"> Faça uma doação no Patreon</span>
		</a>
	`, `
		<button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes">OK</button>
	`);
}

// Removes a specific element
function removeBlock(element) {
	$("body").append(`
		<div class="mdc-snackbar mdc-snackbar--align-start" aria-live="assertive" aria-atomic="true" aria-hidden="true">
			<div class="mdc-snackbar__text"></div>
			<div class="mdc-snackbar__action-wrapper">
				<button type="button" class="mdc-snackbar__action-button"></button>
			</div>
		</div>
	`);

	// Init snackbar
	snackbar = mdc.snackbar.MDCSnackbar.attachTo(document.querySelector(".mdc-snackbar"));

	// Save the removed block
	var removedBlock = $(element).parent().detach();

	const dataObj = {
		message: "Bloco removido",
		actionText: "Desfazer",
		actionHandler: function() {
			$("#editArea").append(removedBlock);
			convertBlocksToCode();
		}
	};

	snackbar.show(dataObj);
	convertBlocksToCode();

	// Event triggered when the snackbar hide
	$(".mdc-snackbar").on("MDCSnackbar:hide", function() {
		$(this).remove();
	});
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

function exportFile(fileContent) {
	// Trim the fileContent specified argument and save
	var blob = new Blob([fileContent.trim().replace(/\n+\s+/g, "")], {
		type: "text/plain;charset=utf-8"
	});
	saveAs(blob, "projeto.html");
}

function importFile() {
	// Append the open file input on page
	$("body").append(`
		<input id="importFileInput" type="file" style="display: none">
	`);

	// Display the "Open File" dialog
	$("#importFileInput").trigger("click");

	// Whenever a file is opened
	$("#importFileInput").on("change", function(e) {
		var reader = new FileReader();

		// Read the selected file
		reader.onload = function(e) {

			// Remove all "script" tags from the file
			$("#editArea").html($.parseHTML(e.target.result));

			// Remove all inline event handlers from code blocks
			$("#editArea *").removeAttr("onclick onchange onmouseover onmouseout onkeydown onload");
			convertBlocksToCode();

		};
		reader.readAsText(e.target.files[0]);
	});
}

// Edit the value of a editable block element
function editBlockValue(blockToEdit) {
	displayDialog("editBlockValueDialog", "Editar valor", `
		<div class="mdc-text-field mdc-text-field--outlined w3-margin-top" data-mdc-auto-init="MDCTextField">
			<input value="${$(blockToEdit).text()}" autocomplete="off" type="text" id="tf-outlined" class="mdc-text-field__input">
			<label for="tf-outlined" class="mdc-floating-label">Digite o novo valor</label>
			<div class="mdc-notched-outline">
				<svg>
					<path class="mdc-notched-outline__path" />
				</svg>
			</div>
			<div class="mdc-notched-outline__idle"></div>
		</div>
	`, `
		<button id="btnOK" type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="yes">OK</button>
		<button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="no">Cancelar</button>
	`);

	$("#btnOK").on("click", function() {
		$(blockToEdit).closest(".commandBlock").find(".block .editable").eq($(blockToEdit).index()).text($("#editBlockValueDialog input").val());
		$(blockToEdit).closest(".commandBlock").find(".code .editable").eq($(blockToEdit).index()).text($("#editBlockValueDialog input").val());
		convertBlocksToCode();
	});
}

function displaySelectCommandDialog() {
	displayDialog("selectCommandDialog", "Adicionar comando", `
		<div class="mdc-text-field mdc-text-field--outlined w3-margin-top" data-mdc-auto-init="MDCTextField">
			<input autocomplete="off" oninput="searchCommands(this, $('#selectCommandDialog .mdc-list'))" type="text" id="tf-outlined" class="mdc-text-field__input">
			<label for="tf-outlined" class="mdc-floating-label">Pesquisar comando</label>
			<div class="mdc-notched-outline">
				<svg>
					<path class="mdc-notched-outline__path" />
				</svg>
			</div>
			<div class="mdc-notched-outline__idle"></div>
		</div>
		<ul class="mdc-list mdc-list--two-line" aria-orientation="vertical"></ul>
		`, `
		<button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="no">Cancelar</button>
	`);

	// Get all data from data.yml
	$.get("assets/data.yml", function(data) {

		// Convert YAML data into JSON
		var convertYamlToJson = jsyaml.load(data);

		// For each command in json...
		$.each(convertYamlToJson, function(i) {

			// Append all the json commands on the sidebar from json
			$("#selectCommandDialog .mdc-list").append(`
				<li onclick="addCommand('${convertYamlToJson[i].cmd_name}');dialog.close()" class="mdc-list-item">
					<span class="mdc-list-item__text">
						<span class="mdc-list-item__primary-text">
							<span class="w3-codespan w3-round">${convertYamlToJson[i].cmd_name}</span>
						</span>
						<span class="mdc-list-item__secondary-text">${convertYamlToJson[i].cmd_description}</span>
					</span>
				</li>
			`);

			// Startup MDC components
			initMDCElements();

		});
	});
}

function searchCommands(input, listItem) {
	$.each($(listItem).children(), function(i) {
		$(this).find(".mdc-list-item__text .mdc-list-item__primary-text").filter(function() {
			$(this).parent().parent().toggle($(this).text().toLowerCase().indexOf($(input).val().toLowerCase()) > -1);
		});
	});

	if ($(listItem).children(":visible").length == 0) {
		$("#notFoundText").remove();
		$(listItem).parent().append(`
			<p id="notFoundText">Nenhum resultado encontrado</p>
		`);
	} else {
		$("#notFoundText").remove();
	}
}

// Generate a MDC dialog with the given arguments
function displayDialog(dialogId, dialogTitle, dialogContent, dialogButtons) {

	$("body").append(`
		<div id="${dialogId}" class="mdc-dialog" role="alertdialog" aria-modal="true">
			<div class="mdc-dialog__container">
				<div class="mdc-dialog__surface">
					<h2 class="mdc-dialog__title">${dialogTitle}</h2>
					<div class="mdc-dialog__content">
						${dialogContent}
					</div>
					<footer class="mdc-dialog__actions">
						${dialogButtons}
					</footer>
				</div>
			</div>
			<div class="mdc-dialog__scrim"></div>
		</div>
	`);

	initMDCElements();

	dialog = new mdc.dialog.MDCDialog(document.querySelector(`#${dialogId}`));
	dialog.open();

	// Event triggered when the dialog is closed
	$(`#${dialogId}`).on("MDCDialog:closed", function() {
		$(`#${dialogId}`).remove();
	});
}

function convertBlocksToCode() {

	// Clear the code output
	$("#codeOutput").html("");

	// For each span with code class...
	$.each($("span.code"), function() {

		tabQuantity = [];
		// If the item has any parents
		if ($(this).parents("ul").length) {
			// For each parent of the actual item...
			$.each($(this).parents("ul"), function() {
				// Adds a tab character to the tabQuantity array
				tabQuantity.push("\t");
			});

			// Remove one tab character from the tabQuantity array (bug fixing)
			tabQuantity.splice(tabQuantity.indexOf("\t"), 1);
			// Show the indented line of code (with tabs)
			$("#codeOutput").append(tabQuantity.join("") + $(this).text() + "\n");
		} else {
			// Show the indented line of code
			$("#codeOutput").append($(this).text() + "\n");
		}

	});

	$("pre").each(function(i, block) {
		hljs.highlightBlock(block);
	});

	// Close button (event listener)
	$(".close").on("click", function() {
		removeBlock(this);
	});

	// Editable field (event listener)
	$(".editable").on("click", function() {
		editBlockValue($(this));
	});
}