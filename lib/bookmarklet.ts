const VEEDU_API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const BOOKMARKLET_CODE = `javascript:(function(){
    var url=window.location.href;
    if(!url.includes("meesho.com")){alert("Veedu Importer only works on meesho.com product pages!");return;}

    /* Read from the already-loaded DOM — no re-fetch, no Akamai block */
    var title=(document.querySelector("h1")||{}).innerText||"";
    if(!title){var og=document.querySelector("meta[property='og:title']");title=og?og.getAttribute("content"):"";}
    title=(title||"").replace(/\\s*[-|–]\\s*meesho.*/i,"").trim()||"Unknown Product";

    /* Price: walk leaf nodes looking for ₹ */
    var price=0;
    var allEls=document.querySelectorAll("*");
    for(var i=0;i<allEls.length;i++){
        var el=allEls[i];
        if(el.children.length===0){
            var m=(el.innerText||"").match(/₹\\s*([0-9,]+)/);
            if(m){price=parseInt(m[1].replace(/,/g,""),10);break;}
        }
    }
    /* Fallback: JSON-LD */
    if(!price){
        var scripts=document.querySelectorAll("script[type='application/ld+json']");
        for(var s=0;s<scripts.length;s++){
            try{var ld=JSON.parse(scripts[s].textContent||"");var p=ld&&(ld.offers&&ld.offers.price||ld.price);if(p){price=parseInt(String(p),10);break;}}catch(e){}
        }
    }

    /* Images from CDN img tags (already in DOM) */
    var imgEls=document.querySelectorAll("img[src*='images.meesho.com/images/products']");
    var imgs=[];
    for(var j=0;j<imgEls.length;j++){
        var src=imgEls[j].src||"";
        if(src&&!src.includes("profile")){
            imgs.push(src.replace(/_(\\d+)\\.(jpg|jpeg|webp|png)(\\?.*)?$/i,"_1024.$2$3"));
        }
    }
    imgs=Array.from(new Set(imgs)).slice(0,6);

    /* Status toast */
    var toast=document.createElement("div");
    toast.innerText="Uploading to Veedu…";
    toast.style.cssText="position:fixed;top:20px;right:20px;background:#F26522;color:white;padding:15px 25px;border-radius:100px;z-index:999999;font-weight:bold;font-size:15px;box-shadow:0 10px 25px rgba(0,0,0,0.2);font-family:sans-serif;";
    document.body.appendChild(toast);

    fetch("${VEEDU_API_URL}/api/admin/scrape-meesho",{
        method:"POST",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({url:url,title:title,price:price,images:imgs})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if(data.success){
            toast.innerText="✅ Added to Veedu!";
            toast.style.background="#2D5A3D";
        }else{
            toast.innerText="❌ "+(data.error||"Upload failed");
            toast.style.background="red";
        }
        setTimeout(function(){toast.remove();},5000);
    })
    .catch(function(){
        toast.innerText="❌ Could not reach Veedu";
        toast.style.background="red";
        setTimeout(function(){toast.remove();},5000);
    });
})();`.replace(/\n/g, '').replace(/    /g, '');
