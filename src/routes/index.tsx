const [adminData,setAdminData]=useState<any>({});
useEffect(()=>{
  setAdminData(JSON.parse(localStorage.getItem("st_admin_all")||"{}"));
  const groups=JSON.parse(localStorage.getItem("st_22_public")||"[]");
  if(groups.length>0){
    // Groups data use করতে পারবে
  }
},[]);