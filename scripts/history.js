$(document).foundation();

var accordionTemp = $(".accordion-content").clone();

var saveHistory = {};
var storedQuestionArray = [];

var fetch_i = 0;

while(localStorage.getItem("QuestionArray" + fetch_i) !=  null) {
    storedQuestionArray = JSON.parse(localStorage.getItem("QuestionArray" + fetch_i));
    renderAccordion(storedQuestionArray);
    fetch_i++;
}


function renderAccordion(storedQuestionArray) { 
       
    //Now there should be a newQuestionArray with all yodafied questions
    //Any errors during call will simply push the already existing item back into the array
    // $("#questionsContainer").empty();
    storedQuestionArray.forEach((item, index) => {
        
        let addQuestionAccordion = myfunction(item, index);
        //$("#accordian-container").prepend(addQuestionAccordion);  
    });
}


function myfunction (storedQuestionArrayObject, index=""){
    
    //var questionAccordion = $("<div>",  {class: "accordion-content", "data-tab-content":any });
    var questionAccordion = $("<div>", {class: "questionContainer"});
    
    //Question Description
    var category = $("<p>").html("Category: " + storedQuestionArrayObject.category);
    
    
    questionAccordion.append(category);
    //Question Description

    var questionType = $("<p>").html("Question Type: " + storedQuestionArrayObject.questionType);
    questionAccordion.append(questionType);

    //Question 

    var question = $("<p>").html("Question : " + storedQuestionArrayObject.question);
    questionAccordion.append(question);

    // questionHistory.options.forEach((item, index) => {
    //     questionHistory.find(`#options${index+1}`).html(item).text();
    // });

    // //remove unused options for specific cards
    // if(newGeneratedQuestion.questionType === "boolean") {
    //     newQuestionCard.find("#label3").remove();
    //     newQuestionCard.find("#label4").remove();
    
    var answer = $("<p>").html("Answer: " + storedQuestionArrayObject.answer);
    questionAccordion.append(answer);
    questionAccordion.append("<br><hr>");
    
    $("#history-content").append(questionAccordion);

}
