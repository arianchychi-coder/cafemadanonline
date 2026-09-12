document.addEventListener("DOMContentLoaded", async()=>{
    const token = localStorage.getItem("accessToken")

    if (!token) {

                lockPage()

       await Swal.fire({
                toast:true,
                position:"top-end",
                icon:"warning",
                title:"توجه",
                text:"توکن شما منقضی شده است ،لطفا دوباره وارد شوید",
                confirmButtonText:"باشه",
                allowOutsideClick: false,
            allowEscapeKey: false
            })

        setTimeout(() => {
        window.location.href = "/loginuser.html"
        }, 2500);
        return
    }

    try {
        
        const response = await fetch("/api/protected",{
            headers:{"Authorization" : "Bearer " + token}
        })

        if (response.status === 403 || response.status===401) {

                    lockPage()

            localStorage.removeItem("accessToken")

          await  Swal.fire({
                toast:true,
                position:"top-end",
                icon:"warning",
                title:"توجه",
                text:"توکن شما منقضی شده است ،لطفا دوباره وارد شوید",
                confirmButtonText:"باشه",
                allowOutsideClick: false,
            allowEscapeKey: false
            })

            setTimeout(() => {
            window.location.href = "/loginuser.html"
            }, 2500);
            return
        }

        if (!response.ok) {
               await Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "خطا",
                text: "خطایی در ارتباط با سرور رخ داد",
                confirmButtonText: "باشه"
            });
            return
        }

        const data = await response.json()
        console.log("Protected data: ",data)

    } catch (error) {
        console.log("Error: ",error)
        alert("Err in server")
    }
})

function lockPage() {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
}