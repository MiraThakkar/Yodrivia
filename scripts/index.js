

$(document).ready(function () {

    //bind functionality to sidebar
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });

    /* ---------------------------------------------------
    CARDS JQUERY
    ----------------------------------------------------- */

    //event click on question card
    $(".card-question").click(function(){
        flipcard();
    })

    //function to flip the question card
    function flipcard (){
        $(".card-question").flip({
            axis: 'x',
        });
    
        }
    
});