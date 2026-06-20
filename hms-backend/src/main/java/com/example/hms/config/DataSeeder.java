package com.example.hms.config;

import com.example.hms.dao.DoctorRepository;
import com.example.hms.dao.NotificationRepository;
import com.example.hms.dao.UserRepository;
import com.example.hms.enums.Genders;
import com.example.hms.enums.Roles;
import com.example.hms.model.Notification;
import com.example.hms.model.profileModel.Doctor;
import com.example.hms.model.profileModel.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      DoctorRepository doctorRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedStaff();
        seedDoctors();
    }

    /* ─────────────────── ADMIN ─────────────────── */
    private void seedAdmin() {
        String adminEmail = "admin@embrace.com";
        var existing = userRepository.findByUserEmail(adminEmail);
        if (existing.isPresent()) {
            User admin = existing.get();
            if (admin.getUserPassword() == null || !admin.getUserPassword().startsWith("$2a$")) {
                admin.setUserPassword(passwordEncoder.encode("Admin@123"));
                userRepository.save(admin);
                System.out.println("✅ Admin password updated for: " + adminEmail);
            } else {
                System.out.println("ℹ️  Admin account ready: " + adminEmail);
            }
        } else {
            try {
                User admin = new User();
                admin.setUserName("Admin");
                admin.setUserEmail(adminEmail);
                admin.setUserPassword(passwordEncoder.encode("Admin@123"));
                admin.setUserPhone("9000000001");
                admin.setUserGender(Genders.MALE);
                admin.setUserRole(Roles.SUPER_ADMIN);
                userRepository.save(admin);
                System.out.println("✅ Default admin account created: " + adminEmail + " / Admin@123");
            } catch (Exception e) {
                System.out.println("⚠️  Could not seed admin: " + e.getMessage());
            }
        }
    }

    /* ─────────────────── STAFF ─────────────────── */
    private void seedStaff() {
        record StaffSeed(String name, String email, String phone, Genders gender, Roles role, String password) {}

        List<StaffSeed> staff = List.of(
                new StaffSeed("Receptionist", "receptionist@embrace.com", "9200000001", Genders.FEMALE, Roles.RECEPTIONIST, "Receptionist@123"),
                new StaffSeed("Lab Technician", "lab@embrace.com", "9200000002", Genders.MALE, Roles.LAB_TECHNICIAN, "Lab@123"),
                new StaffSeed("Pharmacist", "pharmacist@embrace.com", "9200000003", Genders.FEMALE, Roles.PHARMACIST, "Pharmacist@123"),
                new StaffSeed("Nurse", "nurse@embrace.com", "9200000004", Genders.FEMALE, Roles.NURSE, "Nurse@123")
        );

        int created = 0;
        for (StaffSeed s : staff) {
            if (userRepository.findByUserEmail(s.email()).isPresent()) {
                continue;
            }
            try {
                User user = new User();
                user.setUserName(s.name());
                user.setUserEmail(s.email());
                user.setUserPassword(passwordEncoder.encode(s.password()));
                user.setUserPhone(s.phone());
                user.setUserGender(s.gender());
                user.setUserRole(s.role());
                userRepository.save(user);
                created++;
            } catch (Exception e) {
                System.out.println("⚠️  Could not seed staff " + s.name() + ": " + e.getMessage());
            }
        }

        if (created > 0) {
            System.out.println("✅ Seeded " + created + " staff accounts");
        }
    }

    /* ─────────────────── DOCTORS ─────────────────── */
    private void seedDoctors() {
        record DoctorSeed(String name, String email, String phone, Genders gender,
                          String specialization, String room, String hours) {}

        List<DoctorSeed> doctors = List.of(
            new DoctorSeed("Dr. Anil Sharma",       "anil.sharma@embrace.com",      "9100000001", Genders.MALE,   "Cardiology",        "Room 201, Block A", "Mon–Sat: 9:00 AM – 4:00 PM"),
            new DoctorSeed("Dr. Priya Mehta",        "priya.mehta@embrace.com",      "9100000002", Genders.FEMALE, "Neurology",         "Room 305, Block B", "Mon–Fri: 10:00 AM – 5:00 PM"),
            new DoctorSeed("Dr. Rajesh Kumar",       "rajesh.kumar@embrace.com",     "9100000003", Genders.MALE,   "Orthopedics",       "Room 102, Block C", "Mon–Sat: 8:00 AM – 3:00 PM"),
            new DoctorSeed("Dr. Sneha Patel",        "sneha.patel@embrace.com",      "9100000004", Genders.FEMALE, "Pediatrics",        "Room 410, Block A", "Mon–Sat: 9:30 AM – 6:00 PM"),
            new DoctorSeed("Dr. Vikram Singh",       "vikram.singh@embrace.com",     "9100000005", Genders.MALE,   "Oncology",          "Room 503, Block D", "Mon–Fri: 10:00 AM – 4:00 PM"),
            new DoctorSeed("Dr. Kavita Reddy",       "kavita.reddy@embrace.com",     "9100000006", Genders.FEMALE, "Ophthalmology",     "Room 208, Block B", "Tue–Sat: 9:00 AM – 5:00 PM"),
            new DoctorSeed("Dr. Suresh Nair",        "suresh.nair@embrace.com",      "9100000007", Genders.MALE,   "General Medicine",  "Room 101, Block A", "Mon–Sat: 8:00 AM – 8:00 PM"),
            new DoctorSeed("Dr. Meena Iyer",         "meena.iyer@embrace.com",       "9100000008", Genders.FEMALE, "Neurology",         "Room 306, Block B", "Mon–Fri: 11:00 AM – 6:00 PM"),
            new DoctorSeed("Dr. Arjun Desai",        "arjun.desai@embrace.com",      "9100000009", Genders.MALE,   "Cardiology",        "Room 203, Block A", "Mon–Fri: 9:00 AM – 3:00 PM"),
            new DoctorSeed("Dr. Nandini Rao",        "nandini.rao@embrace.com",      "9100000010", Genders.FEMALE, "Dermatology",       "Room 112, Block C", "Mon–Sat: 10:00 AM – 5:00 PM"),
            new DoctorSeed("Dr. Rahul Verma",        "rahul.verma@embrace.com",      "9100000011", Genders.MALE,   "ENT",               "Room 220, Block B", "Mon–Fri: 9:00 AM – 4:00 PM"),
            new DoctorSeed("Dr. Deepika Joshi",      "deepika.joshi@embrace.com",    "9100000012", Genders.FEMALE, "Gynecology",        "Room 401, Block A", "Mon–Sat: 9:00 AM – 5:00 PM"),
            new DoctorSeed("Dr. Sanjay Kapoor",      "sanjay.kapoor@embrace.com",    "9100000013", Genders.MALE,   "Gastroenterology",  "Room 310, Block B", "Mon–Fri: 8:30 AM – 3:30 PM"),
            new DoctorSeed("Dr. Anita Bhatia",       "anita.bhatia@embrace.com",     "9100000014", Genders.FEMALE, "Psychiatry",        "Room 504, Block D", "Mon–Sat: 10:00 AM – 6:00 PM"),
            new DoctorSeed("Dr. Mohan Das",          "mohan.das@embrace.com",        "9100000015", Genders.MALE,   "Pulmonology",       "Room 301, Block C", "Mon–Fri: 9:00 AM – 4:00 PM"),
            new DoctorSeed("Dr. Lakshmi Menon",      "lakshmi.menon@embrace.com",    "9100000016", Genders.FEMALE, "Nephrology",        "Room 405, Block A", "Mon–Sat: 8:00 AM – 2:00 PM"),
            new DoctorSeed("Dr. Kiran Thakur",       "kiran.thakur@embrace.com",     "9100000017", Genders.MALE,   "Urology",           "Room 215, Block C", "Mon–Fri: 10:00 AM – 5:00 PM"),
            new DoctorSeed("Dr. Pooja Saxena",       "pooja.saxena@embrace.com",     "9100000018", Genders.FEMALE, "Endocrinology",     "Room 408, Block A", "Mon–Sat: 9:00 AM – 4:00 PM"),
            new DoctorSeed("Dr. Amit Choudhary",     "amit.choudhary@embrace.com",   "9100000019", Genders.MALE,   "Dermatology",       "Room 113, Block C", "Tue–Sat: 11:00 AM – 7:00 PM"),
            new DoctorSeed("Dr. Ritu Malhotra",      "ritu.malhotra@embrace.com",    "9100000020", Genders.FEMALE, "Ophthalmology",     "Room 210, Block B", "Mon–Fri: 8:00 AM – 3:00 PM"),
            new DoctorSeed("Dr. Vivek Sharma",       "vivek.sharma@embrace.com",     "9100000021", Genders.MALE,   "Orthopedics",       "Room 104, Block C", "Mon–Sat: 9:00 AM – 4:00 PM")
        );

        int created = 0;
        for (DoctorSeed d : doctors) {
            if (userRepository.findByUserEmail(d.email()).isPresent()) {
                continue; // skip if already exists
            }
            try {
                User user = new User();
                user.setUserName(d.name());
                user.setUserEmail(d.email());
                user.setUserPassword(passwordEncoder.encode("Doctor@123"));
                user.setUserPhone(d.phone());
                user.setUserGender(d.gender());
                user.setUserRole(Roles.DOCTOR);
                User savedUser = userRepository.save(user);

                Doctor doctor = new Doctor();
                doctor.setUser(savedUser);
                doctor.setDoctorSpecialization(d.specialization());
                doctor.setDoctorRoom(d.room());
                doctor.setDoctorWorkingHours(d.hours());
                doctorRepository.save(doctor);

                created++;
            } catch (Exception e) {
                System.out.println("⚠️  Could not seed doctor " + d.name() + ": " + e.getMessage());
            }
        }

        if (created > 0) {
            System.out.println("✅ Seeded " + created + " doctor accounts (password: Doctor@123)");
        } else {
            System.out.println("ℹ️  All " + doctors.size() + " doctor accounts already exist");
        }
    }
}
