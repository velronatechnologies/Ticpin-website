const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Kochi",
  "Indore",
];

const CitiesSection = () => {
  return (
    <section className="py-16 lg:py-20 border-t border-border/30">
      <div className="container mx-auto px-4 lg:px-8">
        <h3 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8">
          Book events in your <span className="text-primary">city</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
          {cities.map((city) => (
            <a
              key={city}
              href={`#${city.toLowerCase()}`}
              className="px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-2xl text-foreground font-medium text-sm lg:text-base transition-all duration-200 hover:scale-105 hover:shadow-lg text-center border border-border/50 hover:border-primary/50"
            >
              {city}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CitiesSection;
