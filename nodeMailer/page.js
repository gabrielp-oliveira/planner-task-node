function page (Title,  message, code, link,  message1){
    return `        <div style="margin: 0; padding: 0;
    max-width: 500px;  border: 1px solid rgb(0, 0, 0, 0.1);
    background-color: rgb(239, 239, 247); border-radius: 5px; height: 400px;">
       <div style="margin: 0; padding: 0;">
           <h2 style="color: rgb(27, 17, 100); padding-left: 10px;">${Title}</h2>
           <p style=" margin: 0; padding: 10px;">${message}</p>
       </div>
       <div style="background-color: rgb(235, 222, 213); ">

           <p style=" margin: 0; margin-bottom: 0px; padding: 10px;">Code: <strong>${code}</strong>
           </p>
           <p style="padding-left: 10px;">go the the <a href="${link}" target="_blank" style="font-weight: 600;">planner</a> to use the token. </p>
       </div>
       <div style="padding-left: 10px;">
           <p>${message1}</p>

           <p>This project is part of my <a href="https://gabrielp-oliveira.github.io/" target="_blank" > <span 
               style="
           color: blue;
           font-weight: 600;"
           >
           portfolio</span></a>, so feel free to get in touch for feedback on the code, structure or other reason that will help me become a better programmer! 🚀</p>
       </div>
   </div>`
}

module.exports = page