
  window.addEventListener('load', ()=> {

   var i = 0;
   var sections = document.getElementsByClassName("section");
   var textEL = sections[i].getElementsByClassName("text");
   var delay = 500;

   // setInterval doesn't start immediately, so the first animation call happens earlier.
   animation();

   setInterval(function() {
    i++;
    if (i == sections.length) i = 0;
    animation();
   },
    delay * 15);




   function animation() {

    sections[i].style.opacity = "1";
    textEL = sections[i].getElementsByClassName("text");

    setTimeout(()=> {
     textEL[0].style.transform = "translate(0%)"
    },
     delay)

    setTimeout(()=> {
     textEL[1].style.transform = "translate(0%)"
    },
     delay * 2)

    setTimeout(()=> {
     textEL[2].style.transform = "translate(0%)"
    },
     delay * 3)

    setTimeout(()=> {
     textEL[3].style.transform = "translate(0%)"
    },
     delay * 4)

    // Hide texts after reading... delay*10
    setTimeout(()=> {
     sections[i].style.opacity = "0";
    },
     delay * 10); //

    // Reset the translate for next cycle
    setTimeout(()=> {
     for (var t = 0; t < textEL.length; t++)
      textEL[t].style.transform = "translate(calc(100vw))";
    },
     delay * 14); // Translate transition take 1.7s at least 2s delay from opacity=0 of section

   }

  });
 
