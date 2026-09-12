document.getElementById("requestbtnsssss").addEventListener("click",async function(e){
        console.log("CLICK");
    e.preventDefault()

    const reqform = document.getElementById("requsetForm")

    if (!reqform.checkValidity()) {
        Swal.fire({
            toast:true,
            position:"top-end",
            icon:"waarning",
            title:"توجه",
            text:"لطفا همه فیلئ هازا با دقت پز کنید",
            timer:2500
        })
        return
    }


    const name = reqform.querySelector("input[name='name']").value
    const phone = reqform.querySelector("input[name='phone']").value

    try {
        const response = await fetch("/api/request",{
            method:"POST",
            headers: {"Content-Type" : "application/json"},
            body:JSON.stringify({name,phone})
        })


        const data = await response.json()

        if (!response.ok) {
            Swal.fire({
            toast:true,
            position:"top-end",
            icon:"error",
            title:"خطا",
            text:data.message,
            timer:2500
        })
            return
        }

        else{
           Swal.fire({
            toast:true,
            position:"top-end",
            icon:"success",
            title:"موقق!",
            text:data.message,
            timer:2500
        })
              reqform.reset();
               document.getElementById("phone-error").style.display = "none";
        }

    } catch (error) {
        console.log("Error: ",error)
    }
})




function showToast(message){
    const toast = document.getElementById("toasts");

    toast.textContent = message;
    toast.classList.add("show");
    toast.classList.remove("hide");

    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hide");
    }, 3000);
}