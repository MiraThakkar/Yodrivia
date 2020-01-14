$(document).ready(function () {

    //call the function when load the page (prevent see the back of the card "anwsers")
    flipcard();

    // Put all necessary Event Listeners below here //
    //////////////////////////////////////////////////

    //bind functionality to sidebar
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });

    document.addEventListener('input', function (event) {
        if (event.target.tagName.toLowerCase() !== 'textarea') return;
        autoExpand(event.target);
    }, false);

    //event click on question card controlling the flip
    $(".card-question").click(function(){
        flipcard();
    })   

    //TODO: Add event listener for clicking radio button for user and 
    //      dynamically show or hide correct answer container
    $(document).on("click", ".questionTypeRadio", renderAnswerInputs)
});

//function to flip the question card
function flipcard() {
    $(".card-question").flip({ axis: 'x' });
}

var autoExpand = function (field) {

	// Reset field height
	field.style.height = 'inherit';

	// Get the computed styles for the element
	var computed = window.getComputedStyle(field);

	// Calculate the height
	var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
	             + parseInt(computed.getPropertyValue('padding-top'), 10)
	             + field.scrollHeight
	             + parseInt(computed.getPropertyValue('padding-bottom'), 10)
	             + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

	field.style.height = height + 'px';

};

function renderAnswerInputs() {
    let questionType = '';
    if($(this).attr("data-questionType") === "trueFalse") questionType="true/false";
    if($(this).attr("data-questionType") === "multipleChoice") questionType="Multiple Choice";
    if($(this).attr("data-questionType") === "openEnded") questionType="Open Ended";  

    alert(questionType);
}
