package com.example.ecommerce.config;

import com.example.ecommerce.entity.*;
import com.example.ecommerce.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ReviewRepository reviewRepository,
                          CouponRepository couponRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
        this.couponRepository = couponRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Override
public void run(String... args) {

    // RESET ADMIN PASSWORD TEMPORARILY
    User admin = userRepository.findByUsername("admin").orElse(null);

    if (admin != null) {
        admin.setPassword(passwordEncoder.encode("admin123"));
        userRepository.save(admin);
        System.out.println("✅ Admin password reset");
    }else {
            adminUser = userRepository.findByUsername("admin").orElse(null);
        }

        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setRole("ROLE_USER");
            user.setFullName("John Doe");
            user.setEmail("john.doe@example.com");
            user.setPhoneNumber("+999888777");
            
            Address addr = new Address();
            addr.setStreet("123 E-Commerce Way");
            addr.setCity("San Jose");
            addr.setState("CA");
            addr.setZipCode("95112");
            addr.setCountry("USA");
            addr.setPhoneNumber("+999888777");
            addr.setUser(user);
            
            user.getAddresses().add(addr);
            regularUser = userRepository.save(user);
            System.out.println("✅ Seeded standard user");
        } else {
            regularUser = userRepository.findByUsername("user").orElse(null);
        }

        // 2. Seed Coupons
        if (couponRepository.count() == 0) {
            Coupon c1 = new Coupon(null, "WELCOME10", 10.0, LocalDate.now().plusMonths(3), true);
            Coupon c2 = new Coupon(null, "MEGA25", 25.0, LocalDate.now().plusMonths(1), true);
            Coupon c3 = new Coupon(null, "SUPER50", 50.0, LocalDate.now().minusDays(2), true); // Expired
            couponRepository.saveAll(List.of(c1, c2, c3));
            System.out.println("✅ Seeded coupons");
        }

        // 3. Seed Categories
        if (categoryRepository.count() == 0) {
            Category electronics = categoryRepository.save(new Category(null, "Electronics"));
            Category fashion = categoryRepository.save(new Category(null, "Fashion"));
            Category home = categoryRepository.save(new Category(null, "Home & Living"));
            Category fitness = categoryRepository.save(new Category(null, "Fitness & Outdoors"));
            Category beauty = categoryRepository.save(new Category(null, "Beauty & Personal Care"));

            System.out.println("✅ Seeded categories");

            // 4. Seed Products
            if (productRepository.count() == 0) {
                // Electronics
                Product p1 = new Product();
                p1.setName("Premium Wireless Headphones");
                p1.setDescription("Experience high-fidelity audio with active noise cancellation and 40-hour battery life.");
                p1.setPrice(12999.00);
                p1.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80");
                p1.setBrand("Acoustix");
                p1.setStock(25);
                p1.setDiscountPercentage(15.0);
                p1.setAverageRating(4.5);
                p1.setSpecifications("{\"Bluetooth\":\"5.2\",\"Battery Life\":\"40 Hours\",\"ANC\":\"Active Noise Cancellation\",\"Driver Size\":\"40mm\",\"Weight\":\"250g\"}");
                p1.setCategory(electronics);
                p1.setGalleryImages(List.of(
                        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
                        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80"
                ));

                Product p2 = new Product();
                p2.setName("Minimalist Mechanical Keyboard");
                p2.setDescription("Ultra-compact 60% layout mechanical keyboard with hot-swappable red switches and RGB backlighting.");
                p2.setPrice(6499.00);
                p2.setImageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80");
                p2.setBrand("KeyClick");
                p2.setStock(14);
                p2.setDiscountPercentage(0.0);
                p2.setAverageRating(4.2);
                p2.setSpecifications("{\"Layout\":\"60% Compact\",\"Switches\":\"Hot-Swappable Red\",\"Backlight\":\"RGB Custom\",\"Connection\":\"USB-C / 2.4GHz / Bluetooth\",\"Keys\":\"61\"}");
                p2.setCategory(electronics);

                Product p3 = new Product();
                p3.setName("Smartwatch Pro Series 4");
                p3.setDescription("Stay connected and monitor your health metrics with blood oxygen, heart rate, and sleep tracking.");
                p3.setPrice(18999.00);
                p3.setImageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80");
                p3.setBrand("TimeSync");
                p3.setStock(40);
                p3.setDiscountPercentage(10.0);
                p3.setAverageRating(4.7);
                p3.setSpecifications("{\"Screen\":\"1.78 inch AMOLED\",\"Waterproof\":\"IP68\",\"Battery\":\"Up to 7 Days\",\"Sensors\":\"Heart rate, SpO2, Accelerometer, Gyroscope\",\"OS Compatibility\":\"iOS & Android\"}");
                p3.setCategory(electronics);

                // Fashion
                Product p4 = new Product();
                p4.setName("Classic Leather Messenger Bag");
                p4.setDescription("Handcrafted genuine leather messenger bag featuring dedicated laptop sleeve and premium brass hardware.");
                p4.setPrice(8499.00);
                p4.setImageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80");
                p4.setBrand("Hide & Stitch");
                p4.setStock(8);
                p4.setDiscountPercentage(20.0);
                p4.setAverageRating(4.8);
                p4.setSpecifications("{\"Material\":\"Full Grain Leather\",\"Hardware\":\"Antique Brass\",\"Capacity\":\"15.6 inch Laptop\",\"Pockets\":\"5 Compartments\",\"Strap\":\"Adjustable & Padded\"}");
                p4.setCategory(fashion);

                Product p5 = new Product();
                p5.setName("Urban Knit Sneakers");
                p5.setDescription("Breathable engineered knit upper with responsive foam midsole for ultimate comfort and everyday styling.");
                p5.setPrice(4999.00);
                p5.setImageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80");
                p5.setBrand("Stride");
                p5.setStock(32);
                p5.setDiscountPercentage(5.0);
                p5.setAverageRating(4.4);
                p5.setSpecifications("{\"Upper\":\"Engineered Mesh Knit\",\"Sole\":\"EVA Responsive Foam\",\"Weight\":\"180g per shoe\",\"Type\":\"Running / Casual\",\"Gender\":\"Unisex\"}");
                p5.setCategory(fashion);

                // Home
                Product p6 = new Product();
                p6.setName("Double-Wall Ceramic Coffee Mug");
                p6.setDescription("Double-walled insulating ceramic mug with bamboo lid, keeping your coffee hot and your hands cool.");
                p6.setPrice(1199.00);
                p6.setImageUrl("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80");
                p6.setBrand("BrewAura");
                p6.setStock(120);
                p6.setDiscountPercentage(0.0);
                p6.setAverageRating(4.0);
                p6.setSpecifications("{\"Capacity\":\"350ml\",\"Material\":\"Ceramic & Bamboo\",\"Insulation\":\"Double-Wall Vacuum\",\"Dishwasher Safe\":\"No (Bamboo lid)\",\"Microwave Safe\":\"Yes (Without lid)\"}");
                p6.setCategory(home);

                Product p7 = new Product();
                p7.setName("Aromatic Soy Wax Candle Set");
                p7.setDescription("Set of 3 hand-poured soy wax candles scented with lavender, vanilla, and eucalyptus essential oils.");
                p7.setPrice(1499.00);
                p7.setImageUrl("https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80");
                p7.setBrand("AromaPure");
                p7.setStock(75);
                p7.setDiscountPercentage(10.0);
                p7.setAverageRating(4.6);
                p7.setSpecifications("{\"Wax Type\":\"100% Natural Soy Wax\",\"Burn Time\":\"30 Hours per candle\",\"Scents\":\"Lavender, Vanilla, Eucalyptus\",\"Wick\":\"Organic Cotton\",\"Pack Size\":\"3 Tin Containers\"}");
                p7.setCategory(home);

                Product p8 = new Product();
                p8.setName("Ultra-Thin Wireless Mouse");
                p8.setDescription("Sleek and ergonomic wireless mouse with silent clicking and adjustable DPI sensors.");
                p8.setPrice(1499.00);
                p8.setImageUrl("https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80");
                p8.setBrand("KeyClick");
                p8.setStock(60);
                p8.setDiscountPercentage(0.0);
                p8.setAverageRating(4.1);
                p8.setSpecifications("{\"DPI\":\"1600\",\"Buttons\":\"4\",\"Connection\":\"2.4GHz USB Dongle\",\"Battery\":\"1 AA battery required\",\"Weight\":\"75g\"}");
                p8.setCategory(electronics);

                Product p9 = new Product();
                p9.setName("Portable Bluetooth Speaker");
                p9.setDescription("Waterproof portable speaker with deep bass and up to 12 hours of playtime.");
                p9.setPrice(3499.00);
                p9.setImageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80");
                p9.setBrand("Acoustix");
                p9.setStock(40);
                p9.setDiscountPercentage(5.0);
                p9.setAverageRating(4.3);
                p9.setSpecifications("{\"Power\":\"10W\",\"Waterproof\":\"IPX7\",\"Bluetooth\":\"5.0\",\"Battery Life\":\"12 Hours\",\"Charging\":\"USB-C\"}");
                p9.setCategory(electronics);

                Product p10 = new Product();
                p10.setName("4K Ultra-Wide Monitor");
                p10.setDescription("34-inch curved ultra-wide gaming monitor with HDR10 support and 144Hz refresh rate.");
                p10.setPrice(24999.00);
                p10.setImageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80");
                p10.setBrand("VisionFlow");
                p10.setStock(10);
                p10.setDiscountPercentage(12.0);
                p10.setAverageRating(4.6);
                p10.setSpecifications("{\"Resolution\":\"3440 x 1440\",\"Refresh Rate\":\"144Hz\",\"Panel\":\"IPS\",\"Response Time\":\"1ms\",\"Curvature\":\"1500R\"}");
                p10.setCategory(electronics);

                Product p11 = new Product();
                p11.setName("HD Webcam with Ring Light");
                p11.setDescription("1080p full HD streaming webcam with integrated adjustable three-level ring light.");
                p11.setPrice(2999.00);
                p11.setImageUrl("https://images.unsplash.com/photo-1600541519463-ebec860d5b5a?w=500&q=80");
                p11.setBrand("KeyClick");
                p11.setStock(35);
                p11.setDiscountPercentage(0.0);
                p11.setAverageRating(4.2);
                p11.setSpecifications("{\"Resolution\":\"1080p @ 30FPS\",\"Focus\":\"Autofocus\",\"Microphone\":\"Dual omni-directional\",\"Ring Light\":\"3 Brightness Levels\",\"Cable\":\"1.5m USB\"}");
                p11.setCategory(electronics);

                Product p12 = new Product();
                p12.setName("Unisex Denim Jacket");
                p12.setDescription("Classic style rugged blue denim jacket with functional pockets and premium copper buttons.");
                p12.setPrice(3499.00);
                p12.setImageUrl("https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80");
                p12.setBrand("Stride");
                p12.setStock(18);
                p12.setDiscountPercentage(15.0);
                p12.setAverageRating(4.4);
                p12.setSpecifications("{\"Material\":\"100% Cotton Denim\",\"Fit\":\"Regular Fit\",\"Care\":\"Machine Wash Cold\",\"Pockets\":\"4 Functional Pockets\",\"Buttons\":\"Copper Shank\"}");
                p12.setCategory(fashion);

                Product p13 = new Product();
                p13.setName("Premium Silk Scarf");
                p13.setDescription("Elegant pure Mulberry silk scarf with handwritten floral details, perfect for all seasons.");
                p13.setPrice(1999.00);
                p13.setImageUrl("https://images.unsplash.com/photo-1601924921557-45e6ecd0790e?w=500&q=80");
                p13.setBrand("Hide & Stitch");
                p13.setStock(25);
                p13.setDiscountPercentage(0.0);
                p13.setAverageRating(4.5);
                p13.setSpecifications("{\"Material\":\"100% Mulberry Silk\",\"Dimensions\":\"180cm x 90cm\",\"Care\":\"Dry Clean Only\",\"Design\":\"Handpainted Floral\",\"Weight\":\"60g\"}");
                p13.setCategory(fashion);

                Product p14 = new Product();
                p14.setName("Polarized Wayfarer Sunglasses");
                p14.setDescription("Timeless wayfarer sunglasses with polarized UV400 protective lenses and matte black frames.");
                p14.setPrice(2499.00);
                p14.setImageUrl("https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&q=80");
                p14.setBrand("Stride");
                p14.setStock(50);
                p14.setDiscountPercentage(10.0);
                p14.setAverageRating(4.3);
                p14.setSpecifications("{\"Lens\":\"Polarized TAC\",\"UV Protection\":\"UV400 (100% UVA/UVB)\",\"Frame\":\"Lightweight TR90\",\"Width\":\"142mm\",\"Weight\":\"26g\"}");
                p14.setCategory(fashion);

                Product p15 = new Product();
                p15.setName("Minimalist Quartz Watch");
                p15.setDescription("Classic minimalist analog watch with genuine leather strap and reliable Japanese quartz movement.");
                p15.setPrice(5999.00);
                p15.setImageUrl("https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80");
                p15.setBrand("TimeSync");
                p15.setStock(20);
                p15.setDiscountPercentage(8.0);
                p15.setAverageRating(4.7);
                p15.setSpecifications("{\"Movement\":\"Japanese Quartz\",\"Water Resistance\":\"3 ATM\",\"Case Material\":\"316L Stainless Steel\",\"Strap\":\"Genuine Leather (20mm)\",\"Case Diameter\":\"40mm\"}");
                p15.setCategory(fashion);

                Product p16 = new Product();
                p16.setName("Ergonomic Desk Chair");
                p16.setDescription("High-back office mesh chair with adjustable lumbar support, 3D armrests, and dynamic recline tilt.");
                p16.setPrice(12499.00);
                p16.setImageUrl("https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500&q=80");
                p16.setBrand("HomeStyle");
                p16.setStock(12);
                p16.setDiscountPercentage(10.0);
                p16.setAverageRating(4.5);
                p16.setSpecifications("{\"Mesh\":\"Breathable High-Elastic\",\"Armrests\":\"3D Adjustable\",\"Base\":\"Heavy-Duty Nylon\",\"Capacity\":\"136kg\",\"Gas Lift\":\"Class 4 SGS\"}");
                p16.setCategory(home);

                Product p17 = new Product();
                p17.setName("Automatic Milk Frother");
                p17.setDescription("Electric automatic milk frother and heater for making smooth cappuccinos, lattes, and hot chocolates.");
                p17.setPrice(2499.00);
                p17.setImageUrl("https://images.unsplash.com/photo-1578374173705-969cbe6f2d6f?w=500&q=80");
                p17.setBrand("BrewAura");
                p17.setStock(30);
                p17.setDiscountPercentage(0.0);
                p17.setAverageRating(4.2);
                p17.setSpecifications("{\"Capacity\":\"Froth 150ml / Heat 300ml\",\"Power\":\"500W\",\"Material\":\"Stainless Steel Double-Wall\",\"Heating Element\":\"Strix Controller\",\"Auto Shut-off\":\"Yes\"}");
                p17.setCategory(home);

                Product p18 = new Product();
                p18.setName("Non-Stick Ceramic Frying Pan");
                p18.setDescription("Eco-friendly ceramic non-stick frying pan, free of PFAS, PFOA, lead, and cadmium.");
                p18.setPrice(2199.00);
                p18.setImageUrl("https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&q=80");
                p18.setBrand("BrewAura");
                p18.setStock(45);
                p18.setDiscountPercentage(5.0);
                p18.setAverageRating(4.4);
                p18.setSpecifications("{\"Diameter\":\"10 inch (25cm)\",\"Coating\":\"Thermolon Ceramic Non-Stick\",\"Base\":\"Heavy-Gauge Aluminium\",\"Handle\":\"Stay-Cool Stainless Steel\",\"Induction Ready\":\"Yes\"}");
                p18.setCategory(home);

                Product p19 = new Product();
                p19.setName("Succulent Ceramic Pots Set");
                p19.setDescription("Set of 3 geometric white ceramic succulent planter pots with drainage holes and bamboo saucers.");
                p19.setPrice(1499.00);
                p19.setImageUrl("https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80");
                p19.setBrand("AromaPure");
                p19.setStock(80);
                p19.setDiscountPercentage(0.0);
                p19.setAverageRating(4.1);
                p19.setSpecifications("{\"Material\":\"Ceramic & Bamboo\",\"Drainage Hole\":\"Yes\",\"Pots Included\":\"3 Pieces\",\"Dimensions\":\"8cm x 8cm x 6cm\",\"Plants Included\":\"No\"}");
                p19.setCategory(home);

                // Fitness & Outdoors
                Product p20 = new Product();
                p20.setName("Pro Resistance Bands Set");
                p20.setDescription("Stackable resistance bands set (up to 150 lbs) with ankle straps, door anchor, and carrying pouch.");
                p20.setPrice(999.00);
                p20.setImageUrl("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80");
                p20.setBrand("FitActive");
                p20.setStock(150);
                p20.setDiscountPercentage(15.0);
                p20.setAverageRating(4.6);
                p20.setSpecifications("{\"Bands\":\"5 Anti-Snap Latex Bands\",\"Resistance\":\"10lbs, 20lbs, 30lbs, 40lbs, 50lbs\",\"Accessories\":\"2 Handles, 2 Ankle Straps, 1 Door Anchor\",\"Material\":\"100% Natural Latex\",\"Warranty\":\"1 Year\"}");
                p20.setCategory(fitness);

                Product p21 = new Product();
                p21.setName("Insulated Stainless Steel Bottle");
                p21.setDescription("Double-walled vacuum insulated water bottle keeping beverages cold for 24 hours or hot for 12 hours.");
                p21.setPrice(1899.00);
                p21.setImageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80");
                p21.setBrand("FitActive");
                p21.setStock(90);
                p21.setDiscountPercentage(0.0);
                p21.setAverageRating(4.5);
                p21.setSpecifications("{\"Capacity\":\"750ml\",\"Material\":\"18/8 Food-Grade Stainless Steel\",\"Lid Type\":\"Leakproof Straw Lid\",\"BPA Free\":\"Yes\",\"Coating\":\"Powder-Coated Matte\"}");
                p21.setCategory(fitness);

                Product p22 = new Product();
                p22.setName("Non-Slip Travel Yoga Mat");
                p22.setDescription("Ultra-thin lightweight TPE yoga mat with dual-sided non-slip textures and alignment guide lines.");
                p22.setPrice(2499.00);
                p22.setImageUrl("https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80");
                p22.setBrand("FitActive");
                p22.setStock(55);
                p22.setDiscountPercentage(10.0);
                p22.setAverageRating(4.4);
                p22.setSpecifications("{\"Thickness\":\"6mm\",\"Material\":\"Eco-Friendly TPE\",\"Dimensions\":\"183cm x 61cm\",\"Weight\":\"900g\",\"Carry Strap\":\"Included\"}");
                p22.setCategory(fitness);

                Product p23 = new Product();
                p23.setName("Adjustable Dumbbells Pair");
                p23.setDescription("Selector dial dumbbells pair adjusting from 5 lbs to 52.5 lbs for versatile home strength workouts.");
                p23.setPrice(9999.00);
                p23.setImageUrl("https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500&q=80");
                p23.setBrand("FitActive");
                p23.setStock(15);
                p23.setDiscountPercentage(5.0);
                p23.setAverageRating(4.7);
                p23.setSpecifications("{\"Weight Range\":\"5 to 52.5 lbs per dumbbell\",\"Settings\":\"15 weight increments\",\"Grip\":\"Chrome Knurled Textured\",\"Tray\":\"Safety lock storage tray included\",\"Material\":\"Urethane Coated Steel\"}");
                p23.setCategory(fitness);

                // Beauty & Personal Care
                Product p24 = new Product();
                p24.setName("Organic Rosehip Face Oil");
                p24.setDescription("100% pure cold-pressed organic rosehip seed oil, rich in vitamins and essential fatty acids.");
                p24.setPrice(1299.00);
                p24.setImageUrl("https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&q=80");
                p24.setBrand("PureGlow");
                p24.setStock(110);
                p24.setDiscountPercentage(0.0);
                p24.setAverageRating(4.5);
                p24.setSpecifications("{\"Volume\":\"50ml\",\"Extraction\":\"Cold-Pressed Organic\",\"Skin Type\":\"All Skin Types\",\"Origin\":\"Chile\",\"Free of\":\"Parabens, Sulphates, Synthetics\"}");
                p24.setCategory(beauty);

                Product p25 = new Product();
                p25.setName("Sonic Electric Toothbrush");
                p25.setDescription("Sonic electric toothbrush offering 40,000 micro-brushes per minute and a built-in smart interval timer.");
                p25.setPrice(3999.00);
                p25.setImageUrl("https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&q=80");
                p25.setBrand("PureGlow");
                p25.setStock(30);
                p25.setDiscountPercentage(10.0);
                p25.setAverageRating(4.3);
                p25.setSpecifications("{\"Vibration Speed\":\"40,000 VPM\",\"Modes\":\"Clean, White, Sensitive, Massage\",\"Timer\":\"2-minute smart auto shut-off\",\"Battery Life\":\"Up to 30 Days\",\"Brush Heads\":\"4 DuPont Heads Included\"}");
                p25.setCategory(beauty);

                productRepository.saveAll(List.of(
                        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10,
                        p11, p12, p13, p14, p15, p16, p17, p18, p19, p20,
                        p21, p22, p23, p24, p25
                ));
                System.out.println("✅ Seeded products");

                // 5. Seed Reviews for Product 1 (Wireless Headphones)
                if (regularUser != null) {
                    Review r1 = new Review(null, regularUser, p1, 5, "Unbelievable battery life! Active noise cancellation is solid and isolates background chat perfectly.", LocalDateTime.now().minusDays(10));
                    Review r2 = new Review(null, regularUser, p1, 4, "Sound profile is rich and deep. Docking one star because the head pressure is a bit tight during the first few days.", LocalDateTime.now().minusDays(5));
                    reviewRepository.saveAll(List.of(r1, r2));
                    System.out.println("✅ Seeded reviews");
                }
            }
        }
    }
}
