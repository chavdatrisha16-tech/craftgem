const SUPABASE_URL = "https://tsgrrnivmaujjteavgkf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1b5y0mhKKjobcvFzXHIHOQ_vco2_Ldl";

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
function openCategory(category) {
    alert("You selected: " + category);

    // Later this will connect with the database
    // and show artisans from the selected category.
}


// Simple welcome message
document.addEventListener("DOMContentLoaded", function () {
    console.log("Hidden Gems website loaded successfully!");
});
console.log("Supabase connected:", window.supabaseClient);
