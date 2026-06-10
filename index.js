document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".lead, .section");

  sections.forEach(function (section) {
    section.classList.add("fade-section");
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    {
      threshold: 0.1
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
});

