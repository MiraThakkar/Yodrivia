var questionCardTemplate = $(".cardTemplate").clone();
console.log(questionCardTemplate);

var questionArray = [];

$(document).ready(function () {
    $(".cardTemplate").remove();

    //Generate Category list
    var category= $('#categorySelect');
    $.each(questionCatetory, function(name, value) {
      var option = $("<option/>", {
        text: name,
        value: value
      });
      category.append(option);
    });

    // Put all necessary Event Listeners below here //
    //////////////////////////////////////////////////

    $("#generateQuestions").click(function(){ 
        $("#errorMessage").text("");
        generateQuestionValidation()
    });

    //Generating user question
    $("#addUserQuestionBttn").click(function() {
        let validForm = userFormValidation();
        if(validForm) generateUserQuestion();
    });

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
    $(".card-question").click(function(){ flipcard() }) ;  

    $(document).on("click", ".questionTypeRadio", renderAnswerInputs);
    $(document).on("click", ".card-question", flipcard);
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
    if($(this).attr("data-questionType") === "boolean") {
        $("#trueFalseAnswers").removeClass("d-none");
        $("#userMultipleChoiceAnswers").addClass("d-none")
    } else if($(this).attr("data-questionType") === "multiple") {
        $("#trueFalseAnswers").addClass("d-none");
        $("#userMultipleChoiceAnswers").removeClass("d-none")
    } else if($(this).attr("data-questionType") === "openEnded") {
       //TODO: Time permitting 
    } 
};

//function to flip the question card
function flipcard (){
    $(".card-question").flip({
        axis: 'x',
    });
};

//funtion to call Trivia DB
function triviaDB(numOfQuestions, category="", difficulty=""){
    (category) ? category=`&category=${category}` : category="";
    (difficulty) ? difficulty=`&difficulty=${difficulty}` : difficulty="";

    var triviaURL = `https://opentdb.com/api.php?amount=${numOfQuestions}${category}${difficulty}`
    //ajax trivia call to get the answers generated by Trivia DB
    $.ajax({
        url: triviaURL,
        method: "GET"
        }).then(function(response){

        //TODO: Get response and create question cards appropriately
        console.log(response);           
    });
        
}

function generateQuestionValidation() {
    //Form validation to ensure input are correct
    if(parseInt($("#numOfQuestionsInputDB").val()) < 1 || parseInt($("#numOfQuestionsInputDB").val()) > 50) {
        $("#errorMessage").text("Enter a number between 1-50");
        return;
    }

    let numberOfQuestions = parseInt($("#numOfQuestionsInputDB").val());
    //TODO: get question type and category fields

    $("#myCarousel").empty();
    $("#card-questions-container").empty();

    triviaDB(numberOfQuestions);
}

function userFormValidation() {
    //Reset error to start
    $("#userQuestionInputError").text("");
    $("#questionTypeError").text("");
    $("#userAnswersInputError").text("");

    if($("#userInputQuestion").val().length === 0) {
        $("#userQuestionInputError").text("Please enter a question first...")
        return;
    }

    if($("#userInputQuestionType1").is(":checked")){
        if(($("#userAnswerTrue").is(":checked") || $("#userAnswerFalse").is(":checked")))  return true;
        $("#userAnswersInputError").text("Please select true/false for your question!");
    } else if($("#userInputQuestionType2").is(":checked")) { //multiple choice is clicked
        if(($("#userMultipleChoiceAnswer").val().length > 0) && ($("#userMultipleChoiceA").val().length > 0) && ($("#userMultipleChoiceB").val().length > 0) && ($("#userMultipleChoiceC").val().length > 0)) return true;
        $("#userAnswersInputError").text("Please enter 3 options & answer!");
    } else { //nothing is checked
        $("#questionTypeError").text("Please select question type!");
    }

    
}
    
function generateUserQuestion() {
    $("#myCarousel").empty();
    $("#card-questions-container").empty();

    //Assumed that this function does not fire unless form validation already checked
    let userQuestion = $("#userInputQuestion").val();
    let questionType;
    let options, answer;

    if($("#userInputQuestionType1").is(":checked")) { //boolean
        questionType = $("#userInputQuestionType1").attr("data-questionType");
        options = [ "true", "false"];
        if($("#userAnswerTrue").is(":checked")) {
            answer = true
        } else {
            answer = false;
        }
    } else { //multiple
        questionType = $("#userInputQuestionType2").attr("data-questionType");
        let shuffleOptions = [
            $("#userMultipleChoiceAnswer").val(),
            $("#userMultipleChoiceA").val(),
            $("#userMultipleChoiceB").val(),
            $("#userMultipleChoiceC").val(),
        ];
        shuffle(shuffleOptions);
        options = shuffleOptions;
        answer = $("#userMultipleChoiceAnswer").val();
    }

    //Create the question using the TriviaQuestion class
    let newUserQuestion = new TriviaQuestion(questionType, userQuestion, options, answer, false);
    questionArray.push(newUserQuestion);
    console.log(newUserQuestion);

    //Make the card element from the newQuestion
    let addQuestionCard = generateQuestionCard(newUserQuestion);
    $("#questionsContainer").prepend(addQuestionCard);
    flipcard();
}

function generateQuestionCard(newGeneratedQuestion) {
    console.log("Entered generateQuestionCard")
    let newQuestionCard = questionCardTemplate.clone();
    //Question Header
    newQuestionCard.find("#question-header").text(`Question ${questionArray.length}`);

    //Question Description
    newQuestionCard.find("#questionDescFront").text(newGeneratedQuestion.question);
    newQuestionCard.find("#questionDescBack").text(newGeneratedQuestion.question);

    //Question Options
    newGeneratedQuestion.options.forEach((item, index) => {
        newQuestionCard.find(`#label${index+1}`).text(item);
    });

    //remove unused options for specific cards
    if(newGeneratedQuestion.questionType === "boolean") {
        newQuestionCard.find("#label3").remove();
        newQuestionCard.find("#label4").remove();
    }

    //Question Answer
    newQuestionCard.find("#questionAnswer").text(`Answer: ${newGeneratedQuestion.answer}`);

    newQuestionCard.removeClass("d-none");
    console.log(newQuestionCard.find("label"));
    return newQuestionCard;
}

//Function for shuffling array
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
