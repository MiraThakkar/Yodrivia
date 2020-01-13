

$(document).ready(function () {

    //call the function when load the page (prevent see the back of the card "anwsers")
    flipcard();

    //bind functionality to sidebar
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });

    //event click on question card controlling the flip
    $(".card-question").click(function(){
        flipcard();
    })   
});

//function to flip the question card
function flipcard() {
    $(".card-question").flip({ axis: 'x' });
}