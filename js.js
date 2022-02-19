
var per = document.getElementById("per");
var pro = document.getElementById("pro");
var ace = document.getElementById("ace");
var fil = document.getElementById("fil");
var con = document.getElementById("con");

  function openPer(){
  
per.style.display = "inline-block";
pro.style.display = "none";
ace.style.display = "none";
fil.style.display = "none";
  }

  function openPro(){
  
per.style.display = "none";
pro.style.display = "inline-block";
ace.style.display = "none";
con.style.height = 60+"em";
fil.style.display = "none";
  }

  function openAce(){
  
per.style.display = "none";
pro.style.display = "none";
ace.style.display = "inline-block";
fil.style.display = "none";
  }

  function ofile(){
  
  per.style.display = "none";
  pro.style.display = "none";
  ace.style.display = "none";
  fil.style.display = "inline-block";
  
    }

 var logo = document.getElementById("logo");

logo.style.width = (screen.height/12) + "px";





// setTimeout(() => {location.reload()}, 10000);