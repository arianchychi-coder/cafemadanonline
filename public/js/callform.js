document.getElementById("calbtn").addEventListener("click",async function(e){
    e.preventDefault()

    const form = document.getElementById("callform")

    if (!form.checkValidity()) {
        Swal.fire({
            toast:true,
            position:"top-end",
            icon:"warning",
            title:"لطفا همه فیاد خارا با دقت پر کنید",
            text:data.message,
            timer:2500,

        })
        return
    }


    const name = form.querySelector("input[name='name']").value
    const compenyname = form.querySelector("input[name='compenyname']").value
    const phone = form.querySelector("input[name='phone']").value
    const email = form.querySelector("input[name='email']").value
    const message = form.querySelector("textarea[name='message']").value

    try {
        const response = await fetch("/api/call",{
            method:"POST",
            headers: {"Content-Type" : "application/json"},
            body:JSON.stringify({name,compenyname,phone,email,message})
        })


        const data = await response.json()

        if (!response.ok) {
             Swal.fire({
            toast:true,
            position:"top-end",
            icon:"error",
            title:"خطا",
            text:data.message,
            timer:2500,

        })
            return
        }

        else{
            Swal.fire({
            toast:true,
            position:"top-end",
            icon:"success",
            title:"موفق!",
            text:data.message,
            timer:2500,

        })

               form.reset();

    document.getElementById("phone-error").style.display = "none";
        }

    } catch (error) {
        console.log("Error: ",error)
    }
})




function showToast(message){
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");
    toast.classList.remove("hide");

    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hide");
    }, 3000);
}



document.querySelectorAll("#callform input, #callform textarea").forEach(el => {
    el.setAttribute("autocomplete", "off");
    el.setAttribute("autocorrect", "off");
    el.setAttribute("autocapitalize", "off");
    el.setAttribute("spellcheck", "false");
});

