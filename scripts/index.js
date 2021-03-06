var questionCardTemplate = $(".cardTemplate").clone();

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

    //Generate Difficulty list
    var difficulty= $('#questionDiff');
    $.each(questionDifficulty, function(name, value) {
      var option = $("<option/>", {
        text: name,
        value: value
      });
      difficulty.append(option);
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

    $(document).on("click", ".questionTypeRadio", renderAnswerInputs);
    $(document).on("click", ".card-question", flipcard);
    
    window.addEventListener("resize", resizeQuestionElements);

    //bind for yoda laugh and reset when ended
    $("#yodafyBttn").on("click", yodafyQuestions);

    document.getElementById("yodaLaugh").addEventListener('ended', function() {
        this.currentTime = 0;
    }, false);

    //delete button listener
    $(document).on("click", "#deleteQuestionBttn", deleteCurrentQuestion);
});

function deleteCurrentQuestion() {
    let removeItemIndex = parseInt($(this).parent().find("#question-header").text()) - 1;
    questionArray.splice(removeItemIndex, 1);
    $("#questionsContainer").empty();
    if(questionArray.length > 0) {
        questionArray.forEach((item, index) => {
            let addQuestionCard = generateQuestionCard(item, index);
            $("#questionsContainer").prepend(addQuestionCard);
        });
    }
}

function yodafyQuestions() {
    //Play yoda laugh
    document.getElementById("yodaLaugh").play();

    //Reach out to the Yoda Translator API
    yodaTranslatorUrl = `https://yodish.p.rapidapi.com/yoda.json`;

    let newQuestionArray = [];
    questionArray.forEach((item, index) => {
        //if already yodafied, don't query (already been done)
        if(!item.yodafied) {
            $.ajax({
                url: yodaTranslatorUrl,
                headers: {
                    "x-rapidapi-host": "yodish.p.rapidapi.com",
                    "x-rapidapi-key": apiKey,
                    "content-type": "application/x-www-form-urlencoded"
                },
                method: 'POST',
                dataType: 'json',
                data: {
                    "text": item.question
                },
            }).then(function(response) {
                item.question = response.contents.translated;
                item.yodafied = true;
                newQuestionArray.push(item);
                reRenderQuestions(newQuestionArray)
            }).fail(function() {
                newQuestionArray.push(item);
                reRenderQuestions(newQuestionArray)
            }); 
        } else {
            newQuestionArray.push(item);
            reRenderQuestions(newQuestionArray)
        }
    });
}

function reRenderQuestions(newQuestionArray) {
    //Now there should be a newQuestionArray with all yodafied questions
    //Any errors during call will simply push the already existing item back into the array
    $("#questionsContainer").empty();
    newQuestionArray.forEach((item, index) => {
        let addQuestionCard = generateQuestionCard(item, index);
        $("#questionsContainer").prepend(addQuestionCard);
        flipcard();
    });
}

function resizeQuestionElements() {
    $("#questionsContainer").children(".card").each(function() {
        var divHeight = $(this).find(".front").height(); 
        $(this).find(".back").css('height', (divHeight+20)+'px');
    });
}

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

//funtion to call Trivia DB
function triviaDB(numOfQuestions, category="", difficulty=""){
    (category) ? category=`&category=${category}` : category="";
    (difficulty) ? difficulty=`&difficulty=${difficulty}` : difficulty="";

    var triviaURL = `https://opentdb.com/api.php?amount=${numOfQuestions}${category}${difficulty}`;

    //ajax trivia call to get the answers generated by Trivia DB
    $.ajax({
        url: triviaURL,
        method: "GET"
        }).then(function(response){

        //TODO: Get response and create question cards appropriately  
        generateDBQuestions(response);       
    });
        
}

function generateDBQuestions(response) {
    const { results } = response;

    results.forEach((item, index) => {
        let shuffleOptions = [];
        if(item.type === "boolean") {
            shuffleOptions = ["true", "false"];
        } else { //multiple choice
            item.incorrect_answers.forEach((item) => { shuffleOptions.push(item); });
            shuffleOptions.push(item.correct_answer);
            shuffle(shuffleOptions);
        }
        let newGeneratedQuestion = new TriviaQuestion(item.type, item.question, shuffleOptions, item.correct_answer, false);
        questionArray.push(newGeneratedQuestion);

        //Make the card element from the newQuestion
        let addQuestionCard = generateQuestionCard(newGeneratedQuestion);
        $("#questionsContainer").prepend(addQuestionCard);
        flipcard();
    });
}

function generateQuestionValidation() {
    //Form validation to ensure input are correct
    if(parseInt($("#numOfQuestionsInputDB").val()) < 1 || parseInt($("#numOfQuestionsInputDB").val()) > 50) {
        $("#errorMessage").text("Enter a number between 1-50");
        return;
    }

    if(!$("#numOfQuestionsInputDB").val()) {
        $("#errorMessage").text("Enter a number between 1-50");
        return;
    }

    let numberOfQuestions = parseInt($("#numOfQuestionsInputDB").val());
    //TODO: get question type and category fields
    let questionCategory = getQuestionCategory();
    let questionDiff = getQuestionDifficulty();

    $("#myCarousel").empty();
    $("#card-questions-container").empty();
    $("#yodafyBttn").removeClass("d-none");
    $("#yodafyBttn").addClass("d-flex");
    $("#yodafyBttn").addClass("flex-wrap");

    triviaDB(numberOfQuestions, questionCategory, questionDiff);
}

function getQuestionCategory() {
    return $("#categorySelect").val();
}

function getQuestionDifficulty() {
    return $("#questionDiff").val(); 
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
    $("#yodafyBttn").removeClass("d-none");
    $("#yodafyBttn").addClass("d-flex");
    $("#yodafyBttn").addClass("flex-wrap");

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

    //Make the card element from the newQuestion
    let addQuestionCard = generateQuestionCard(newUserQuestion);
    $("#questionsContainer").prepend(addQuestionCard);
    flipcard();
}

function generateQuestionCard(newGeneratedQuestion, index="") {
    
    let newQuestionCard = questionCardTemplate.clone();
    if(newGeneratedQuestion.yodafied) newQuestionCard.find("#yodafiedCard").removeClass("d-none");

    //Question Header
    if(index === "") {
        newQuestionCard.find("#question-header").text(questionArray.length);
        newQuestionCard.find("#questionHeaderBack").text(questionArray.length);
    } else {
        newQuestionCard.find("#question-header").text(index+1);
        newQuestionCard.find("#questionHeaderBack").text(index+1);
    }


    //Question Description
    newQuestionCard.find("#questionDescFront").html(newGeneratedQuestion.question).text();
    newQuestionCard.find("#questionDescBack").html(newGeneratedQuestion.question).text();

    //Question Options
    newGeneratedQuestion.options.forEach((item, index) => {
        newQuestionCard.find(`#label${index+1}`).html(item).text();
    });

    //remove unused options for specific cards
    if(newGeneratedQuestion.questionType === "boolean") {
        newQuestionCard.find("#label3").remove();
        newQuestionCard.find("#label4").remove();
    }

    //Question Answer
    newQuestionCard.find("#questionAnswer").html(`Answer: ${newGeneratedQuestion.answer}`).text();

    newQuestionCard.removeClass("d-none");
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
