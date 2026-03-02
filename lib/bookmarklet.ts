const VEEDU_API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const BOOKMARKLET_CODE = `javascript:(function(){
    var url=window.location.href;
    if(!url.includes("meesho.com")){alert("Veedu Importer only works on meesho.com product pages!");return;}
    fetch(document.location.href,{credentials:"include"})
    .then(function(r){return r.text()})
    .then(function(html){
        var titleMatch=html.match(/<h1[^>]*>(.*?)<\\/h1>/ui);
        var title=titleMatch?titleMatch[1].replace(/<[^>]+>/g,"").trim():"Unknown Product";
        var priceMatch=html.match(/\u20b9([0-9,]+)/u);
        var price=priceMatch?parseInt(priceMatch[1].replace(/,/g,""),10):0;
        var imgRegex=/<img[^>]+src="([^"]+images\\.meesho\\.com\\/images\\/products\\/[^"]+)"/g;
        var imgs=[];var m;
        while(m=imgRegex.exec(html)){imgs.push(m[1].replace(/_[0-9]+\\.jpg/g,"_1024.jpg"));}
        imgs=Array.from(new Set(imgs)).filter(function(i){return !i.includes("profile")}).slice(0,4);
        var statusBtn=document.createElement("div");
        statusBtn.innerText="Uploading to Veedu...";
        statusBtn.style.position="fixed";
        statusBtn.style.top="20px";
        statusBtn.style.right="20px";
        statusBtn.style.background="#F26522";
        statusBtn.style.color="white";
        statusBtn.style.padding="15px 25px";
        statusBtn.style.borderRadius="100px";
        statusBtn.style.zIndex="999999";
        statusBtn.style.fontWeight="bold";
        statusBtn.style.boxShadow="0 10px 25px rgba(0,0,0,0.2)";
        document.body.appendChild(statusBtn);
        fetch("${VEEDU_API_URL}/api/admin/scrape-meesho",{
            method:"POST",
            credentials:"include",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({url:url,title:title,price:price,images:imgs})
        })
        .then(function(res){return res.json()})
        .then(function(data){
            if(data.success){
                statusBtn.innerText="✅ Added to Veedu!";
                statusBtn.style.background="#2D5A3D";
                setTimeout(function(){statusBtn.remove()},5000);
            }else{
                statusBtn.innerText="❌ Upload Failed";
                statusBtn.style.background="red";
            }
        })
        .catch(function(err){
            statusBtn.innerText="❌ Veedu server offline!";
            statusBtn.style.background="red";
        });
    });
})();`.replace(/\n/g, '').replace(/    /g, '');
