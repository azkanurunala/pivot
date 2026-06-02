import ExpoModulesCore
import GameKit

// GameKit bridge for Pivot. No login UI — GKLocalPlayer auto-authenticates with
// the device Apple ID. The auth handler is long-lived and can fire repeatedly,
// so we NEVER capture a single Promise inside it (resolving twice crashes). We
// park pending promises in an array and settle them all when auth resolves.

public class ExpoGameCenterModule: Module {
  private var authenticated = false
  private var authStarted = false
  private var pendingAuth: [Promise] = []

  public func definition() -> ModuleDefinition {
    Name("ExpoGameCenter")

    AsyncFunction("authenticate") { (promise: Promise) in
      DispatchQueue.main.async {
        if self.authenticated { promise.resolve(true); return }
        self.pendingAuth.append(promise)
        if self.authStarted { return }
        self.authStarted = true

        GKLocalPlayer.local.authenticateHandler = { [weak self] viewController, error in
          guard let self = self else { return }
          DispatchQueue.main.async {
            if let vc = viewController {
              // Present the Game Center sign-in sheet if the system asks for it.
              self.presentViewController(vc)
              return // handler will fire again once the user finishes
            }
            let ok = GKLocalPlayer.local.isAuthenticated
            self.authenticated = ok
            let waiting = self.pendingAuth
            self.pendingAuth.removeAll()
            waiting.forEach { $0.resolve(ok) }
          }
        }
      }
    }

    AsyncFunction("isAuthenticated") { () -> Bool in
      return GKLocalPlayer.local.isAuthenticated
    }

    AsyncFunction("submitScore") { (score: Int, leaderboardID: String, promise: Promise) in
      guard GKLocalPlayer.local.isAuthenticated else { promise.resolve(false); return }
      if #available(iOS 14.0, *) {
        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local,
                                  leaderboardIDs: [leaderboardID]) { error in
          promise.resolve(error == nil)
        }
      } else {
        let gkScore = GKScore(leaderboardIdentifier: leaderboardID)
        gkScore.value = Int64(score)
        GKScore.report([gkScore]) { error in promise.resolve(error == nil) }
      }
    }

    AsyncFunction("presentLeaderboard") { (leaderboardID: String, promise: Promise) in
      DispatchQueue.main.async {
        let vc: GKGameCenterViewController
        if #available(iOS 14.0, *) {
          vc = GKGameCenterViewController(leaderboardID: leaderboardID, playerScope: .global, timeScope: .allTime)
        } else {
          vc = GKGameCenterViewController()
          vc.leaderboardIdentifier = leaderboardID
        }
        vc.gameCenterDelegate = LeaderboardDelegate.shared
        self.presentViewController(vc)
        promise.resolve(true)
      }
    }

    AsyncFunction("loadTopScores") { (leaderboardID: String, count: Int, promise: Promise) in
      guard #available(iOS 14.0, *) else { promise.resolve([]); return }
      GKLeaderboard.loadLeaderboards(IDs: [leaderboardID]) { boards, error in
        guard let board = boards?.first, error == nil else { promise.resolve([]); return }
        let range = NSRange(location: 1, length: max(1, min(count, 100)))
        board.loadEntries(for: .global, timeScope: .allTime, range: range) { local, entries, _, err in
          guard err == nil else { promise.resolve([]); return }
          var rows: [[String: Any]] = []
          let localID = GKLocalPlayer.local.gamePlayerID
          for e in (entries ?? []) {
            rows.append([
              "rank": e.rank,
              "name": e.player.displayName,
              "score": e.score,
              "me": e.player.gamePlayerID == localID,
            ])
          }
          promise.resolve(rows)
        }
      }
    }
  }

  private func presentViewController(_ vc: UIViewController) {
    guard let root = UIApplication.shared.connectedScenes
      .compactMap({ ($0 as? UIWindowScene)?.keyWindow })
      .first?.rootViewController else { return }
    var top = root
    while let presented = top.presentedViewController { top = presented }
    top.present(vc, animated: true)
  }
}

private class LeaderboardDelegate: NSObject, GKGameCenterControllerDelegate {
  static let shared = LeaderboardDelegate()
  func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
    gameCenterViewController.dismiss(animated: true)
  }
}
