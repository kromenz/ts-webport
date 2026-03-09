const ContactMe = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8 text-black dark:text-white">
          Get In Touch
        </h2>
        <p className="text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-12">
          I&apos;m currently looking for new opportunities. Whether you have a
          question or just want to say hi, I&apos;ll try my best to get back to
          you!
        </p>
        <div className="flex justify-center">
          <a
            href="mailto:rafael@example.com"
            className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
            Say Hello
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactMe;
