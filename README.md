# GSP++

GSP++ is a mobile attendance application built with React Native and Expo. It allows students to view and track their attendance by securely connecting to the university portal, parsing the response, and presenting the data in a clean, easy-to-use interface.

## Features

- **Secure Login** – Authenticate using your university portal credentials
- **Overall Attendance** – View your total attendance percentage at a glance
- **Theory & Lab Breakdown** – Separate views for theory and practical/lab subjects
- **Subject-wise Attendance** – Detailed attendance for each subject with attended/total classes
- **Semester Switching** – Toggle between available semesters
- **Pull-to-Refresh** – Manually refresh attendance data anytime
- **Light & Dark Mode** – Automatic theme switching with manual override
- **Offline Support** – Cached data available when network is unavailable
- **Last Fetched Timestamp** – See when data was last updated

## Download

You can download the latest APK from the **[Releases page](https://github.com/mahtab89/GSP/releases)**.

**⚠️ Play Protect Warning:** Since this app isn't on the Play Store (I don't have $25 for a developer account 😅), Google Play Protect might flag it as "harmful" or "unrecognized." This is a false positive—the app is completely open source and connects directly to your university portal. Just tap "More info" → "Install anyway" or scan it with your preferred antivirus if you're paranoid. The source code is right here for you to audit.

## Tech Stack

- **React Native** – Cross-platform mobile framework
- **Expo** – Development platform and toolchain
- **TypeScript** – Type-safe development
- **Expo Secure Store** – Encrypted credential storage
- **AsyncStorage** – Offline data caching
- **React Native Safe Area Context** – Safe area handling
- **Expo Vector Icons** – Icon library
- **React Native SVG** – Circular progress charts

## How It Works

The app connects directly to the university portal using your credentials, parses the HTML response, extracts attendance data, and displays it in an organized manner. All parsing happens locally on your device—no data passes through external servers.

## Privacy Focused

- **No external servers** – All communication is directly between your device and the university portal
- **Credentials stored locally** – Encrypted on-device using Expo Secure Store
- **No tracking or analytics** – Zero data collection, no third-party services
- **Offline-first** – Cached data remains on your device only
- **Open source** – Full transparency, auditable code

## Future Features

- **Push notifications** – Alerts when attendance drops below threshold
- **Widget support** – Quick attendance glance from home screen
- **Export data** – PDF/CSV export for records
- **Auto-refresh scheduling** – Configurable background sync
- **Attendance predictor** – Project future attendance based on current trends

## Platform Support

- **Android** – Fully supported
- **iOS** – Planned for future release

## Status

GSP++ is currently under active development. The application is not yet available on the Google Play Store and is being tested before its first public release.

## Open Source

GSP++ is open source and contributions are welcome. If you would like to contribute, you can:

- Report bugs
- Suggest new features
- Improve the UI
- Improve performance
- Fix issues
- Improve documentation
- Submit pull requests

Before making a large change, it is recommended to open an issue first so the change can be discussed.

## Contributing

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes
4. Test the application
5. Commit your changes
6. Open a pull request

Please keep contributions simple, readable, and consistent with the existing code.

## Disclaimer

GSP++ is an independent application and is not affiliated with or officially endorsed by any institution or its portal. Users are responsible for their own login credentials and use of the application.

## License

This project is open source. See the `LICENSE` file for the license and terms of use.
